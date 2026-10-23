import goals from './goals.json' with { type: 'json' }
import requirements from './requirements.json' with { type: 'json' }
import documents from './documents.json' with { type: 'json' }
import services from './services.json' with { type: 'json' }
import barangays from './barangays.json' with { type: 'json' }
import officials from './officials.json' with { type: 'json' }
import cityFacts from './cityFacts.json' with { type: 'json' }
import updates from './updates.json' with { type: 'json' }
import { planningQuestions, planningRules } from './planningRules.js'
import { generatePlan } from '../utils/planGenerator.js'

export const STALE_DAYS = 90

const administrativeDistricts = [
  'Poblacion', 'Talomo', 'Agdao', 'Buhangin', 'Bunawan', 'Paquibato',
  'Baguio', 'Calinan', 'Marilog', 'Toril', 'Tugbok',
]

// Return copies so callers can use goals without changing the sample catalog.
export function getGoals() {
  return goals.map((goal) => ({ ...goal }))
}

// Return service copies with nested contact details isolated from the catalog.
export function getServices() {
  return services.map(copyService)
}

// Find a service by its stable URL slug.
export function getServiceBySlug(slug) {
  const service = services.find((item) => item.slug === slug)
  return service ? copyService(service) : null
}

// Return service copies for one of the published categories.
export function getServicesByCategory(category) {
  return services.filter((item) => item.category === category).map(copyService)
}

// Return all barangays, including clearly flagged sample fixtures.
export function getBarangays() {
  return barangays.map((item) => ({ ...item }))
}

// Find a barangay by its stable URL slug.
export function getBarangayBySlug(slug) {
  const barangay = barangays.find((item) => item.slug === slug)
  return barangay ? { ...barangay } : null
}

// Return the fixed district names supplied by the project seed.
export function getDistricts() {
  return [...administrativeDistricts]
}

// Return copies of the offices-only officials list.
export function getOfficials() {
  return officials.map((item) => ({ ...item }))
}

// Return copies of city facts.
export function getCityFacts() {
  return cityFacts.map((item) => ({ ...item }))
}

// Return copies of update records.
export function getUpdates() {
  return updates.map((item) => ({ ...item }))
}

// Return copies of matching requirements to keep the sample catalog unchanged.
export function getRequirementsByGoal(goalId) {
  return requirements.filter((requirement) => requirement.goalId === goalId)
    .map((requirement) => ({ ...requirement }))
}

// Return copies so callers can use documents without changing the sample records.
export function getDocuments() {
  return documents.map((document) => ({ ...document }))
}

// Derive dashboard counts from the catalog so totals follow the sample records.
export function getSummaryCounts() {
  return {
    goals: goals.length,
    requirementsDone: requirements.filter((requirement) => requirement.status === 'done').length,
    documentsExpiring: documents.filter((document) => document.status === 'expiring').length,
  }
}

// Search public directories and return matching records grouped by type.
export function searchAll(query) {
  const normalizedQuery = query.trim().toLowerCase()
  const searchable = {
    services,
    barangays: barangays.filter((item) => !item.isSample),
    requirements,
    updates,
  }
  return Object.fromEntries(Object.entries(searchable).map(([type, records]) => [
    type,
    normalizedQuery
      ? records.filter((record) => searchableText(record).includes(normalizedQuery))
        .map((record) => type === 'services' ? copyService(record) : { ...record })
      : [],
  ]))
}

// Derive verification counts, stale items, time-sensitive records, and gaps from catalogs.
export function getStatusReport(today = new Date()) {
  const recordGroups = {
    services,
    barangays: barangays.filter((item) => !item.isSample),
    requirements,
    officials,
    cityFacts,
    updates,
    documents: documents.map((item) => ({
      ...item,
      title: item.type,
      type: 'document',
      verification: item.verification ?? 'unverified',
      lastVerified: item.lastVerified ?? null,
      sourceUrl: item.sourceUrl ?? '',
      timeSensitive: item.timeSensitive ?? false,
    })),
  }
  const records = Object.entries(recordGroups).flatMap(([group, items]) =>
    items.map((item) => ({ ...item, dataType: group })),
  )
  const verificationCounts = Object.fromEntries(Object.entries(recordGroups).map(([type, items]) => [
    type,
    items.reduce((counts, item) => {
      const state = ['verified', 'unverified', 'conflicting'].includes(item.verification)
        ? item.verification
        : 'unverified'
      counts[state] += 1
      return counts
    }, { verified: 0, unverified: 0, conflicting: 0 }),
  ]))
  const staleBefore = today.getTime() - STALE_DAYS * 86400000
  const stale = records.filter((record) => {
    const verifiedAt = validDate(record.lastVerified)
    return record.verification === 'verified' && verifiedAt && verifiedAt.getTime() < staleBefore
  })
  return {
    verificationCounts,
    stale,
    timeSensitive: records.filter((record) => record.timeSensitive),
    knownGaps: records.filter((record) => record.verification !== 'verified'),
  }
}

// Copy questions and options so callers cannot change the sample choices.
export function getPlanningQuestions() {
  return planningQuestions.map((question) => ({
    ...question,
    options: question.options.map((option) => ({ ...option })),
  }))
}

function copyService(service) {
  return {
    ...service,
    contact: { ...service.contact, phone: [...service.contact.phone] },
    ...(service.steps ? { steps: [...service.steps] } : {}),
  }
}

function searchableText(record) {
  return Object.values(record).flatMap((value) => {
    if (typeof value === 'string') return [value]
    if (Array.isArray(value)) return value.filter((item) => typeof item === 'string')
    if (value && typeof value === 'object') return Object.values(value).filter((item) => typeof item === 'string')
    return []
  }).join(' ').toLowerCase()
}

function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const date = new Date(`${value}T00:00:00Z`)
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value
    ? null
    : date
}

// Adapt catalog records into plan steps while preserving numeric IDs and catalog fields.
export function getChecklistPlan(goalId, answers = {}) {
  const goal = goals.find((item) => item.id === goalId)
  if (!goal) {
    return { steps: [], unresolved: [], cycles: [], warnings: ['Unknown goal.'], ok: false }
  }
  const catalog = getRequirementsByGoal(goalId)
  const result = generatePlan(
    { id: String(goalId), requirements: catalog.map((item) => String(item.id)) },
    answers,
    catalog.map((item) => ({
      ...item,
      id: String(item.id),
      title: item.label,
      ...planningRules[item.id],
    })),
  )
  const records = new Map(catalog.map((item) => [String(item.id), item]))
  return {
    ...result,
    steps: result.steps.map((step) => ({
      ...step,
      id: step.kind === 'requirement' ? records.get(step.id).id : step.id,
      requirement: records.has(step.id) ? { ...records.get(step.id) } : null,
    })),
  }
}
