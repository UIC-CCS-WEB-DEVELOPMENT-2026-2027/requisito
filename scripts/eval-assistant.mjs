import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { setTimeout as delay } from 'node:timers/promises'
import { getAssistantRecords, REFUSAL, STALE_DAYS, verificationOf } from '../netlify/lib/assistant-records.js'

export const EVAL_DELAY_MS = 13000
const ENDPOINT = 'http://localhost:3000/api/chat'
const records = getAssistantRecords()
const definitions = JSON.parse(readFileSync(new URL('../docs/ai-eval-questions.json', import.meta.url), 'utf8'))
export const EVAL_CASE_COUNT = definitions.length

function categoryFor(definition) {
  return definition.category ??
    (definition.id.startsWith('injection-') ? 'injection' :
      definition.id.startsWith('pii-') ? 'pii' :
        definition.kind === 'reject' ? 'input-refusal' :
          definition.kind === 'warning' ? 'verification-warning' :
            definition.kind === 'verified' ? 'normal-answer' : 'unknown-answer')
}

// Generate questions from reviewed records, never from invented requirement facts.
export function prepareCases(catalog = records) {
  const verified = catalog.filter(record => verificationOf(record) === 'verified')
  const eligible = catalog.filter(record => verificationOf(record) !== 'unverified')
  const warningRecords = catalog.filter(record => verificationOf(record) === 'conflicting' ||
    (verificationOf(record) === 'verified' && Date.now() - Date.parse(record.lastVerified) > STALE_DAYS * 86400000) ||
    (!eligible.length && verificationOf(record) === 'unverified'))
  const cases = []
  const skipped = []
  for (const definition of definitions) {
    let question = definition.repeat ? 'x'.repeat(definition.repeat) : definition.question
    let expectedId
    if (definition.kind === 'verified' || definition.kind === 'warning') {
      const sourceCatalog = definition.recordType
        ? catalog.filter(item => item.type === definition.recordType)
        : catalog
      const candidates = definition.kind === 'verified'
        ? sourceCatalog.filter(record => verificationOf(record) === 'verified')
        : sourceCatalog.filter(record => warningRecords.some(warning => warning.id === record.id))
      const record = candidates[definition.recordIndex]
      if (!record) { skipped.push(definition.id); continue }
      question = `What information is listed for ${record.label ?? record.title}?`
      expectedId = record.id
    }
    cases.push({ ...definition, category: categoryFor(definition), question, expectedId })
  }
  return { cases, skipped, verifiedCount: verified.length }
}

// These checks assess the response contract; Caleb must also review factual meaning.
export function checkResult(item, status, data, catalog = records) {
  if (item.kind === 'reject') return status === 400 && typeof data?.error === 'string'
  if (status !== 200 || typeof data?.answer !== 'string' || !Array.isArray(data.sources) || !Array.isArray(data.warnings)) return false
  if (!['verified', 'partial', 'unknown'].includes(data.confidence)) return false
  if (!data.sources.every(source => catalog.some(record => record.id === source.id && record.label === source.label &&
      record.sourceUrl === source.sourceUrl && record.lastVerified === source.lastVerified && record.status === source.status))) return false
  if (item.kind === 'unknown') return data.confidence === 'unknown' && data.sources.length === 0 && data.answer === REFUSAL
  if (item.kind === 'verified') return data.confidence !== 'unknown' && data.sources.some(source => source.id === item.expectedId)
  return data.warnings.length > 0 && data.confidence !== 'verified'
}

export async function runEvaluation({ live = false } = {}) {
  const { cases, skipped, verifiedCount } = prepareCases()
  if (!live) {
    console.table(definitions.map(definition => ({
      id: definition.id,
      category: categoryFor(definition),
      expected: definition.kind,
      status: skipped.includes(definition.id) ? 'SKIPPED - no verified fixture' : 'READY - not run',
    })))
    console.log(`${EVAL_CASE_COUNT} scripted questions; ${cases.length} runnable now; ${skipped.length} answer cases lack verified fixtures.`)
    console.log('No network request made. Add --live only when you explicitly want to call the local function and configured provider.')
    return { cases, skipped, networkCalled: false }
  }
  if (verifiedCount < 8) console.warn(`SKIPPED: only ${verifiedCount} of 8 verified records`)
  if (skipped.length) console.warn(`WARNING: ${skipped.length} CASES SKIPPED. THIS IS NOT A COMPLETE ACCURACY PASS.`)
  let failed = 0
  const results = []
  for (const item of cases) {
    let calledProvider = false
    try {
      const response = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: item.question }), signal: AbortSignal.timeout(15000) })
      // Older handlers without this header get the conservative delay for valid input.
      calledProvider = item.kind !== 'reject' && response.headers.get('X-Assistant-Provider') !== 'skipped'
      const data = await response.json()
      const passed = checkResult(item, response.status, data)
      if (!passed) failed++
      results.push({ id: item.id, category: item.category, status: passed ? 'PASS' : 'FAIL', http: response.status })
    } catch {
      failed++
      results.push({ id: item.id, category: item.category, status: 'FAIL', http: 'request failed' })
      // The provider may still be processing a timed-out local request.
      calledProvider = item.kind !== 'reject'
    }
    if (calledProvider) await delay(EVAL_DELAY_MS)
  }
  console.table(results)
  console.log(`${cases.length - failed} PASS; ${failed} FAIL; ${skipped.length} SKIPPED`)
  if (skipped.length) console.warn('WARNING: SKIPPED CASES MEAN ACCURACY IS NOT FULLY EVALUATED.')
  process.exitCode = failed ? 1 : 0
  return { cases, skipped, failed, networkCalled: true }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await runEvaluation({ live: process.argv.includes('--live') })
}
