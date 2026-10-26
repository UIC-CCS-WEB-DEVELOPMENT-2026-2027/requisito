// Data flow: JSON file, then helper, then page, then card through props.
// Helpers return copies so pages and cards can use local data without mutating the source catalogs.
import goals from './goals.json' with { type: 'json' }
import requirements from './requirements.json' with { type: 'json' }
import requirementSources from './requirementSources.json' with { type: 'json' }
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
import featureCatalogs from './featureCatalogs.json' with { type: 'json' }
import sourceWatchState from '../../data/source-watch-state.json' with { type: 'json' }
import { planningQuestions, planningRules } from './planningRules.js'
import { generatePlan } from '../utils/planGenerator.js'
import { getRecordCounts as countRecords } from './recordCounts.js'
import { rankSearchRecords } from './search.js'

export const STALE_DAYS = 90

const administrativeDistricts = [
  'Poblacion', 'Talomo', 'Agdao', 'Buhangin', 'Bunawan', 'Paquibato',
  'Baguio', 'Calinan', 'Marilog', 'Toril', 'Tugbok',
]

// Return copies so callers can use goals without changing the sample catalog.
export function getGoals() {
  return goals.map((goal) => ({
    ...goal,
    requirementIds: [...(goal.requirementIds ?? [])],
  }))
}

export function getGoalById(goalId) {
  const goal = goals.find((item) => item.id === goalId && !item.isSample)
  return goal ? { ...goal, requirementIds: [...(goal.requirementIds ?? [])] } : null
}

export function getGoalBySlug(slug) {
  const goal = goals.find((item) => item.slug === slug && !item.isSample)
  return goal ? { ...goal, requirementIds: [...(goal.requirementIds ?? [])] } : null
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

export function getDistrictSummary() {
  return administrativeDistricts.map((name) => ({
    name,
    count: barangays.filter((record) => !record.isSample && record.adminDistrict === name).length,
  }))
}

export function getBarangaysByDistrict(name) {
  return barangays.filter((record) => !record.isSample && record.adminDistrict === name)
    .map((record) => ({ ...record }))
    .sort((left, right) => left.title.localeCompare(right.title, 'en', { sensitivity: 'base' }))
}

export function getRecordCounts() {
  return countRecords(getAuditedCollections())
}

function getAuditedCollections() {
  return {
    services,
    barangays,
    officials,
    cityFacts,
    updates,
    history,
    budget,
    procurement,
    briefs,
    elections,
    accountability,
    requirements,
  }
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

// Empty feature catalogs stay explicit until reviewed, source-backed records exist.
export function getFeatureRecords(catalogName) {
  const records = featureCatalogs[catalogName]
  if (!Array.isArray(records)) throw new Error(`Unknown feature catalog: ${catalogName}`)
  return records.map((record) => structuredClone(record))
}

// Finder results are limited to complete briefs whose source review is verified.
export function getVerifiedGuides(category = '') {
  return filterVerifiedGuides(getBriefs(), category)
}

export function filterVerifiedGuides(guides, category = '') {
  return guides.filter((brief) =>
    brief.verification === 'verified' &&
    (!category || brief.category === category) &&
    Boolean(brief.title?.trim()) &&
    Boolean(brief.description?.trim()) &&
    hasHttpsSource(brief.sourceUrl) &&
    Array.isArray(brief.steps) &&
    brief.steps.length > 0 &&
    Array.isArray(brief.whatYouNeed),
  )
}

function hasHttpsSource(value) {
  try {
    const source = new URL(value)
    return source.protocol === 'https:' && !source.username && !source.password
  } catch {
    return false
  }
}

export function getElections() {
  return elections.map((item) => ({ ...item }))
}

export function getAccountability() {
  return accountability.map((item) => ({ ...item }))
}

// Return copies of matching requirements to keep the sample catalog unchanged.
export function getRequirementsByGoal(goalId) {
  const goal = goals.find((item) => item.id === goalId)
  if (!goal) return []
  const byId = new Map(requirements.map((item) => [item.id, item]))
  return [...new Set(goal.requirementIds ?? [])]
    .map((id) => byId.get(id))
    .filter(Boolean)
    .map(copyRequirement)
}

// Document guides are the same canonical records used to build goal checklists.
export function getDocuments() {
  return requirements.filter((requirement) => requirement.guideInstructions)
    .map((requirement) => getDocumentGuideBySlug(requirement.slug))
}

export function getDocumentGuideBySlug(slug) {
  const requirement = requirements.find((item) => item.slug === slug && item.guideInstructions)
  if (!requirement) return null
  const linkedGoals = goals.filter((goal) =>
    !goal.isSample && (goal.requirementIds ?? []).includes(requirement.id),
  )
  const sourcesById = new Map(requirementSources.map((source) => [source.id, source]))
  return {
    ...copyRequirement(requirement),
    goals: linkedGoals.map((goal) => ({ ...goal, requirementIds: [...goal.requirementIds] })),
    sources: (requirement.sourceIds ?? [])
      .map((id) => sourcesById.get(id))
      .filter(Boolean)
      .map((source) => structuredClone(source)),
  }
}

export function getRequirementSources() {
  return requirementSources.map((source) => structuredClone(source))
}

// Derive dashboard counts from the catalog so totals follow the sample records.
export function getSummaryCounts() {
  return {
    ...getRecordCounts(),
    goals: goals.filter((goal) => !goal.isSample).length,
    unverified: getStatusReport().knownGaps.length,
  }
}

// Search public directories and return matching records grouped by type.
export function searchAll(query) {
  const sourcesById = new Map(requirementSources.map((source) => [source.id, source]))
  const requirementsWithSources = withoutSamples(requirements).map((requirement) => {
    const linkedSources = (requirement.sourceIds ?? [])
      .map((sourceId) => sourcesById.get(sourceId))
      .filter(Boolean)
    return {
      ...requirement,
      sourceAgencies: [...new Set(linkedSources.map((source) => source.agency))],
      sourceTitles: linkedSources.map((source) => source.title),
      sourceClaims: linkedSources.flatMap((source) => source.supports ?? []),
      linkedSources: linkedSources.map((source) => ({
        id: source.id,
        title: source.title,
        url: source.url,
        verification: source.verification,
        lastChecked: source.lastChecked,
      })),
    }
  })
  const requirementSlugsBySourceId = new Map()
  for (const requirement of requirementsWithSources) {
    for (const sourceId of requirement.sourceIds ?? []) {
      const slugs = requirementSlugsBySourceId.get(sourceId) ?? []
      slugs.push(requirement.slug)
      requirementSlugsBySourceId.set(sourceId, slugs)
    }
  }

  const searchable = {
    goals: withoutSamples(goals),
    services: withoutSamples(services),
    barangays: withoutSamples(barangays),
    requirements: requirementsWithSources,
    sources: requirementSources.map((source) => ({
      ...source,
      searchTerms: [source.id.replace(/([a-z])(\d)/gi, '$1 $2').replaceAll('-', ' ')],
      description: (source.supports ?? []).join(' '),
      notes: source.limitations ?? '',
      category: source.agency,
      verification: source.verification,
      sourceUrl: source.url,
      linkedRequirementSlugs: requirementSlugsBySourceId.get(source.id) ?? [],
    })),
    updates: withoutSamples(updates),
    history: withoutSamples(history),
    briefs: withoutSamples(briefs),
    budget: withoutSamples(budget),
    procurement: withoutSamples(procurement),
    elections: withoutSamples(elections),
    accountability: withoutSamples(accountability),
    districts: getDistrictSummary().map((district) => ({
      id: `district-${district.name.toLowerCase()}`,
      slug: district.name,
      type: 'district',
      title: district.name,
      description: `${district.count} barangays`,
      category: 'District',
      sourceUrl: '',
      verification: 'unverified',
      lastVerified: null,
      timeSensitive: false,
      notes: '',
    })),
  }
  return Object.fromEntries(Object.entries(searchable).map(([type, records]) => [
    type,
    rankSearchRecords(records, query)
      .map((record) => type === 'services' ? copyService(record) :
        type === 'briefs' ? { ...record, steps: [...record.steps], whatYouNeed: [...record.whatYouNeed] } :
          type === 'sources' ? { ...record, supports: [...record.supports], linkedRequirementSlugs: [...record.linkedRequirementSlugs] } :
            { ...record }),
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
export function getPlanningQuestions(goalId) {
  return planningQuestions
    .filter((question) => goalId === undefined || !question.goalIds || question.goalIds.includes(goalId))
    .map((question) => ({
    ...question,
    ...(question.goalIds ? { goalIds: [...question.goalIds] } : {}),
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
  return records.filter((record) =>
    !record.isSample && !/\b(sample|placeholder|fictional)\b/i.test(`${record.title ?? ''} ${record.description ?? ''}`),
  )
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
  const catalog = requirements.map(copyRequirement)
  const result = generatePlan(
    { id: String(goalId), requirements: [...new Set(goal.requirementIds ?? [])].map(String) },
    answers,
    catalog.map((item) => ({
      ...planningRules[item.id],
      ...item,
      id: String(item.id),
      title: item.label,
    })),
  )
  const records = new Map(catalog.map((item) => [String(item.id), item]))
  return {
    ...result,
    steps: result.steps.map((step) => ({
      ...step,
      id: step.kind === 'requirement' ? records.get(step.id).id : step.id,
      requirement: records.has(step.id) ? copyRequirement(records.get(step.id)) : null,
    })),
  }
}

function copyRequirement(requirement) {
  return structuredClone(requirement)
}
