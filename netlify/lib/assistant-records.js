import process from 'node:process'
import requirements from '../../src/data/requirements.json' with { type: 'json' }
import services from '../../src/data/services.json' with { type: 'json' }

export const STALE_DAYS = 90
export const REFUSAL = "I don't have verified information on that. Please confirm with the issuing office."
export const TEST_WARNING = 'TEST MODE: unverified placeholder data'

export function refusal(warnings = []) {
  return { answer: REFUSAL, confidence: 'unknown', sources: [], warnings }
}

// Progress status never determines whether government information was verified.
export function verificationOf(record) {
  const label = record.label ?? record.title
  if (!Number.isInteger(record.id) || !['requirement', 'service', 'hotline'].includes(record.type) ||
      typeof label !== 'string' || typeof record.notes !== 'string' ||
      typeof record.sourceUrl !== 'string' ||
      (record.lastVerified !== null && typeof record.lastVerified !== 'string')) return 'unverified'
  if (record.type === 'requirement' && (!Number.isInteger(record.goalId) || typeof record.copies !== 'number')) {
    return 'unverified'
  }
  if (!['verified', 'unverified', 'conflicting'].includes(record.verification)) return 'unverified'
  if (record.verification !== 'verified') return record.verification
  let source
  try { source = new URL(record.sourceUrl) } catch { return 'unverified' }
  const allowedHosts = (process.env.OFFICIAL_DOMAIN_ALLOWLIST ?? '')
    .split(',').map(host => host.trim().toLowerCase()).filter(Boolean)
  if (source.protocol !== 'https:' ||
      (!source.hostname.toLowerCase().endsWith('.gov.ph') && !allowedHosts.includes(source.hostname.toLowerCase())) ||
      source.username || source.password ||
      /\b(sample|placeholder|fictional)\b/i.test(record.notes) || !validDate(record.lastVerified) ||
      record.lastVerified > today()) return 'unverified'
  return 'verified'
}

export function getAssistantRecords() {
  const serviceRecords = services.map(service => ({
    ...service,
    label: service.title,
    goalId: 0,
    copies: 1,
    status: service.verification,
    notes: [
      service.description,
      ...service.contact.phone,
      service.contact.email,
      service.contact.address,
      service.contact.hours,
      service.notes,
    ].filter(Boolean).join('. '),
  }))
  return [...requirements.map(record => ({ ...record })), ...serviceRecords]
}

function today() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date())
}

function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

// Keep small catalogs whole; rank larger ones using distinct question words.
export function retrieve(records, question) {
  if (records.length <= 40) return records
  const words = [...new Set(question.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [])]
  return records.map(record => {
    const text = `${record.label} ${record.notes}`.toLowerCase()
    return { record, score: words.filter(word => text.includes(word)).length }
  }).sort((a, b) => b.score - a.score).slice(0, 8).map(item => item.record)
}

export function containsPersonalData(text) {
  return /\d{8}/.test(text.replace(/[\s-]/g, '')) || /[^\s@]+@[^\s@]+\.[^\s@]+/.test(text)
}

// Reject model-written links and dates instead of presenting them as sourced facts.
function unsafeAnswer(text) {
  return containsPersonalData(text) || /(?:https?:|www\.|\b[\w-]+\.(?:[a-z]{2,})(?:\b|\/))/i.test(text) ||
    /\b\d{1,4}[-/.]\d{1,2}(?:[-/.]\d{1,4})?\b|\b(?:19|20)\d{2}\b/.test(text) ||
    /\b(?:january|february|march|april|may|june|july|august|september|october|november|december|enero|pebrero|marso|abril|mayo|hunyo|hulyo|agosto|setyembre|oktubre|nobyembre|disyembre)\s+\d/i.test(text)
}

// Sources and warnings come from server records, never from provider-supplied fields.
export function buildAnswer(text, records, testMode, keys = []) {
  const warnings = testMode ? [TEST_WARNING] : []
  let result
  try { result = JSON.parse(text) } catch { return refusal(warnings) }
  if (!result || typeof result.answer !== 'string' || !result.answer.trim() || result.answer.length > 3000 ||
      !Array.isArray(result.used_ids) || !['verified', 'partial', 'unknown'].includes(result.confidence) ||
      unsafeAnswer(result.answer) || keys.some(key => result.answer.includes(key)) ||
      /(?:AQ\.|AIza|sk-)[\w.-]{16,}/.test(result.answer)) return refusal(warnings)
  if (result.confidence === 'unknown') return refusal(warnings)
  const used = [...new Set(result.used_ids)].filter(Number.isInteger)
    .map(id => records.find(record => record.id === id)).filter(Boolean)
  if (!used.length) return refusal(warnings)
  let confidence = testMode ? 'partial' : result.confidence
  const sources = used.map(record => {
    const verification = verificationOf(record)
    if (verification !== 'verified') {
      warnings.push(`${record.label}: ${verification} information; confirm with the issuing office.`)
      confidence = 'partial'
    }
    if (!validDate(record.lastVerified) || record.lastVerified > today()) {
      warnings.push(`${record.label}: invalid verification date.`)
      confidence = 'partial'
    } else if ((Date.parse(today()) - Date.parse(record.lastVerified)) / 86400000 > STALE_DAYS) {
      warnings.push(`${record.label}: verification is older than ${STALE_DAYS} days.`)
      confidence = 'partial'
    }
    return { id: record.id, label: record.label, sourceUrl: record.sourceUrl,
      lastVerified: record.lastVerified, status: record.status, verification }
  })
  return { answer: result.answer.trim(), confidence, sources, warnings }
}
