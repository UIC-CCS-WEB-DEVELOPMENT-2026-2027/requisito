import goals from './goals.json' with { type: 'json' }
import requirements from './requirements.json' with { type: 'json' }
import documents from './documents.json' with { type: 'json' }
import services from './services.json' with { type: 'json' }
import barangays from './barangays.json' with { type: 'json' }
import officials from './officials.json' with { type: 'json' }
import cityFacts from './cityFacts.json' with { type: 'json' }
import updates from './updates.json' with { type: 'json' }
import history from './history.json' with { type: 'json' }
import budget from './budget.json' with { type: 'json' }
import procurement from './procurement.json' with { type: 'json' }
import briefs from './briefs.json' with { type: 'json' }
import elections from './elections.json' with { type: 'json' }
import accountability from './accountability.json' with { type: 'json' }
import sourceWatchState from '../../data/source-watch-state.json' with { type: 'json' }
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

export function getHistory() {
  return history.map((item) => ({ ...item }))
    .sort((left, right) => (right.year ?? -Infinity) - (left.year ?? -Infinity))
}

export function getBudget() {
  return budget.map((item) => ({ ...item }))
}

export function getProcurement() {
  return procurement.map((item) => ({ ...item }))
}

export function getBriefs() {
  return briefs.map((item) => ({ ...item, steps: [...item.steps], whatYouNeed: [...item.whatYouNeed] }))
}

export function getElections() {
  return elections.map((item) => ({ ...item }))
}

export function getAccountability() {
  return accountability.map((item) => ({ ...item }))
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
    services: withoutSamples(services),
    barangays: withoutSamples(barangays),
    requirements: withoutSamples(requirements),
    updates: withoutSamples(updates),
    history: withoutSamples(history),
    briefs: withoutSamples(briefs),
    budget: withoutSamples(budget),
    procurement: withoutSamples(procurement),
    elections: withoutSamples(elections),
    accountability: withoutSamples(accountability),
  }
  return Object.fromEntries(Object.entries(searchable).map(([type, records]) => [
    type,
    normalizedQuery
      ? records.filter((record) => searchableText(record).includes(normalizedQuery))
        .map((record) => type === 'services' ? copyService(record) :
          type === 'briefs' ? { ...record, steps: [...record.steps], whatYouNeed: [...record.whatYouNeed] } : { ...record })
      : [],
  ]))
}

// Derive verification counts, stale items, time-sensitive records, and gaps from catalogs.
export function getStatusReport(today = new Date()) {
  const recordGroups = {
    services: withoutSamples(services),
    barangays: withoutSamples(barangays),
    requirements: withoutSamples(requirements),
    officials: withoutSamples(officials),
    cityFacts: withoutSamples(cityFacts),
    updates: withoutSamples(updates),
    history: withoutSamples(history),
    briefs: withoutSamples(briefs),
    budget: withoutSamples(budget),
    procurement: withoutSamples(procurement),
    elections: withoutSamples(elections),
    accountability: withoutSamples(accountability),
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

export function getCityMonitor() {
  const report = getStatusReport()
  return {
    verificationCounts: report.verificationCounts,
    stale: report.stale,
    timeSensitive: report.timeSensitive,
    gapCounts: Object.fromEntries(Object.entries(report.verificationCounts).map(([type, counts]) => [
      type,
      counts.unverified + counts.conflicting,
    ])),
    sourceWatch: getSourceWatchStatus(),
  }
}

export function getSourceWatchStatus() {
  return {
    lastChecked: sourceWatchState.lastChecked,
    changed: Object.values(sourceWatchState.entries ?? {}).filter((entry) => entry.status === 'changed').length,
    unreachable: Object.values(sourceWatchState.entries ?? {}).filter((entry) => entry.status === 'unreachable').length,
    unchanged: Object.values(sourceWatchState.entries ?? {}).filter((entry) => entry.status === 'unchanged').length,
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

function withoutSamples(records) {
  return records.filter((record) => !record.isSample)
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
