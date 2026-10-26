import path from 'node:path'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import process from 'node:process'
import {
  allowedSource,
  barangayCatalogIssues,
  validBarangayDistrict,
  validDate,
  requirementEvidenceIssues,
  reviewIsExpired,
  verificationIssues,
} from './audit-rules.mjs'
import { getRecordCounts } from '../src/data/recordCounts.js'
import { planningQuestions } from '../src/data/planningRules.js'
import en from '../src/i18n/en.json' with { type: 'json' }
import fil from '../src/i18n/fil.json' with { type: 'json' }
import ceb from '../src/i18n/ceb.json' with { type: 'json' }

const dataDirectory = process.env.AUDIT_DATA_DIR
  ? path.resolve(process.env.AUDIT_DATA_DIR)
  : fileURLToPath(new URL('../src/data/', import.meta.url))
const readData = (name) =>
  JSON.parse(readFileSync(path.join(dataDirectory, `${name}.json`), 'utf8'))

const goals = readData('goals')
const requirements = readData('requirements')
const requirementSources = readData('requirementSources')
const featureCatalogs = readData('featureCatalogs')
const goalIds = new Set(goals.map((goal) => goal.id))
const planningQuestionValues = new Map(
  planningQuestions.map((question) => [
    question.id,
    new Set(question.options.map((option) => option.value)),
  ]),
)
const localeCatalogs = [en, fil, ceb]
const districts = [
  'Poblacion', 'Talomo', 'Agdao', 'Buhangin', 'Bunawan', 'Paquibato',
  'Baguio', 'Calinan', 'Marilog', 'Toril', 'Tugbok',
]
const officialHosts = (process.env.OFFICIAL_DOMAIN_ALLOWLIST ?? '')
  .split(',')
  .map((host) => host.trim().toLowerCase())
  .filter(Boolean)
const allowedTypes = new Set([
  'service', 'hotline', 'barangay', 'official', 'fact', 'update', 'requirement',
  'history', 'budget', 'procurement', 'brief', 'election', 'accountability',
])
const requiredCatalogs = [
  'services', 'barangays', 'officials', 'cityFacts', 'updates', 'history',
  'budget', 'procurement', 'briefs', 'elections', 'accountability',
]
const errors = []
const auditedRecords = []
const today = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit',
}).format(new Date())

function auditRecord(record, type, index, seenIds, seenSlugs) {
  const label = `${type}[${index}] (${record.title ?? record.id ?? 'unknown'})`
  const recordErrors = []
  if (!['string', 'number'].includes(typeof record.id) || String(record.id).trim() === '') recordErrors.push('invalid id')
  else if (seenIds.has(String(record.id))) recordErrors.push('duplicate id')
  else seenIds.add(String(record.id))
  if (typeof record.slug !== 'string' || !record.slug.trim()) recordErrors.push('missing slug')
  else if (seenSlugs.has(record.slug)) recordErrors.push('duplicate slug')
  else seenSlugs.add(record.slug)
  if (!allowedTypes.has(record.type)) recordErrors.push('invalid type')
  if (typeof record.title !== 'string' || !record.title.trim()) recordErrors.push('missing title')
  if (typeof record.description !== 'string') recordErrors.push('invalid description')
  if (typeof record.category !== 'string' || !record.category.trim()) recordErrors.push('missing category')
  if (typeof record.sourceUrl !== 'string') recordErrors.push('invalid sourceUrl')
  if (!['verified', 'unverified', 'conflicting'].includes(record.verification)) recordErrors.push('invalid verification')
  if (typeof record.timeSensitive !== 'boolean') recordErrors.push('invalid timeSensitive')
  if (typeof record.notes !== 'string') recordErrors.push('invalid notes')
  recordErrors.push(...verificationIssues(record, today, officialHosts))
  if (record.type === 'barangay' && !validBarangayDistrict(record.adminDistrict, districts)) {
    recordErrors.push('invalid administrative district')
  }
  if (record.type === 'service' || record.type === 'hotline') {
    if (!['Emergency', 'Health', 'Business and Permits', 'Information'].includes(record.category)) {
      recordErrors.push('invalid service category')
    }
    if (!record.contact || !Array.isArray(record.contact.phone)) recordErrors.push('invalid contact')
  }
  if (record.type === 'requirement') {
    if (record.demoOnly !== undefined && typeof record.demoOnly !== 'boolean') {
      recordErrors.push('invalid demoOnly flag')
    }
    if (record.demoOnly === true && record.requirementType === 'mandatory') {
      recordErrors.push('demo-only requirement cannot claim mandatory status')
    }
    if (!goalIds.has(record.goalId)) recordErrors.push('unknown goalId')
    if (typeof record.label !== 'string' || !record.label.trim()) recordErrors.push('missing label')
    if (record.copies !== null && typeof record.copies !== 'number') recordErrors.push('invalid copies')
    if (!['unverified', 'done'].includes(record.status)) recordErrors.push('invalid status')
    if (!['mandatory', 'conditional', 'recommended'].includes(record.requirementType)) {
      recordErrors.push('invalid requirementType')
    }
    if (!Number.isInteger(record.revision) || record.revision < 1) recordErrors.push('invalid revision')
    if (!Array.isArray(record.sourceIds)) recordErrors.push('invalid sourceIds')
    if (typeof record.guideInstructions !== 'string' || !record.guideInstructions.trim()) {
      recordErrors.push('missing guideInstructions')
    }
    for (const sourceId of record.sourceIds ?? []) {
      if (!requirementSources.some((source) => source.id === sourceId)) {
        recordErrors.push(`unknown sourceId "${sourceId}"`)
      }
    }
    if (record.applicability !== undefined &&
        !['reported-general', 'reported-conditional'].includes(record.applicability)) {
      recordErrors.push('invalid applicability')
    }
    if (record.applicability === 'reported-conditional' &&
        (!record.when || typeof record.when !== 'object' || Array.isArray(record.when) ||
          !Object.keys(record.when).length || typeof record.conditionKey !== 'string' || !record.conditionKey.trim())) {
      recordErrors.push('reported conditional requirement needs when and conditionKey')
    }
    if (record.when &&
        typeof record.when === 'object' && !Array.isArray(record.when)) {
      for (const [questionId, expectedValues] of Object.entries(record.when)) {
        const acceptedValues = Array.isArray(expectedValues) ? expectedValues : [expectedValues]
        const knownValues = planningQuestionValues.get(questionId)
        if (!knownValues) {
          recordErrors.push(`unknown condition question "${questionId}"`)
        } else if (acceptedValues.some((value) => typeof value !== 'string' || !knownValues.has(value))) {
          recordErrors.push(`invalid answer for condition question "${questionId}"`)
        }
      }
    }
    if (record.conditionKey !== undefined && typeof record.conditionKey !== 'string') {
      recordErrors.push('invalid conditionKey')
    }
    for (const field of ['labelKey', 'notesKey', 'conditionKey']) {
      if (record[field] !== undefined &&
          (typeof record[field] !== 'string' || localeCatalogs.some((locale) => !Object.hasOwn(locale, record[field])))) {
        recordErrors.push(`invalid localized field "${field}"`)
      }
    }
    if (record.validityMonths !== null && (!Number.isFinite(record.validityMonths) || record.validityMonths < 0)) {
      recordErrors.push('invalid validityMonths')
    }
    if (record.type === 'history' && record.year !== null && (!Number.isInteger(record.year) || record.year < 1 || record.year > Number(today.slice(0, 4)) + 1)) {
      recordErrors.push('invalid history year')
    }
    if (record.type === 'brief' && (!Array.isArray(record.steps) || !Array.isArray(record.whatYouNeed))) {
      recordErrors.push('invalid brief steps or whatYouNeed')
    }
    if (record.type === 'budget') {
      if (!Number.isInteger(record.fiscalYear) || record.fiscalYear < 1900 || record.fiscalYear > Number(today.slice(0, 4)) + 5) {
        recordErrors.push('invalid fiscalYear')
      }
      if (typeof record.amountPHP !== 'number' || !Number.isFinite(record.amountPHP) || record.amountPHP < 0) {
        recordErrors.push('invalid amountPHP')
      }
      if (record.verification === 'verified' && record.isSample) recordErrors.push('verified budget row is marked sample')
    }
    if (record.type === 'procurement') {
      if (typeof record.amountPHP !== 'number' || !Number.isFinite(record.amountPHP) || record.amountPHP < 0) {
        recordErrors.push('invalid amountPHP')
      }
      if (record.awardDate !== null && !validDate(record.awardDate)) recordErrors.push('invalid awardDate')
      if (record.verification === 'verified' && record.isSample) recordErrors.push('verified procurement row is marked sample')
    }
    if (record.type === 'accountability' &&
        !['audit-report', 'ordinance', 'resolution', 'public-statement'].includes(record.kind)) {
      recordErrors.push('invalid accountability kind')
    }
  }
  auditedRecords.push({
    type,
    title: record.title ?? String(record.id),
    verification: record.verification ?? 'invalid',
    sample: Boolean(record.isSample),
    result: recordErrors.length ? 'FAIL' : 'PASS',
  })
  for (const issue of recordErrors) errors.push(`${label}: ${issue}`)
}

for (const name of requiredCatalogs) {
  const records = readData(name)
  if (!Array.isArray(records)) {
    errors.push(`${name}: expected an array`)
    continue
  }
  const ids = new Set()
  const slugs = new Set()
  records.forEach((record, index) => auditRecord(record, name, index, ids, slugs))
  if (name === 'barangays') errors.push(...barangayCatalogIssues(records))
}

const featureCatalogNames = [
  'reports', 'events', 'assets', 'publicRecords', 'mapLocations', 'transitRoutes',
  'heritageSites', 'tourismPlaces', 'cinemas', 'communityTools', 'estateListings',
  'civicAuditEntries',
]
const featureRecordFields = [
  'id', 'slug', 'type', 'title', 'description', 'category', 'sourceUrl',
  'lastVerified', 'verification', 'timeSensitive', 'notes',
]
for (const name of featureCatalogNames) {
  const records = featureCatalogs[name]
  if (!Array.isArray(records)) {
    errors.push(`featureCatalogs.${name}: expected an array`)
    continue
  }
  const ids = new Set()
  const slugs = new Set()
  records.forEach((record, index) => {
    const label = `featureCatalogs.${name}[${index}]`
    for (const field of featureRecordFields) {
      if (!Object.hasOwn(record, field)) errors.push(`${label}: missing ${field}`)
    }
    if (ids.has(String(record.id))) errors.push(`${label}: duplicate id`)
    if (slugs.has(record.slug)) errors.push(`${label}: duplicate slug`)
    ids.add(String(record.id))
    slugs.add(record.slug)
  })
}

const requirementIds = new Set()
const requirementSlugs = new Set()
requirements.forEach((record, index) => auditRecord(record, 'requirements', index, requirementIds, requirementSlugs))
const requirementIdSet = new Set(requirements.map((record) => record.id))
const goalRequirementIds = new Set()
for (const goal of goals) {
  if (!Array.isArray(goal.requirementIds)) {
    errors.push(`goals.${goal.slug ?? goal.id}: requirementIds must be an array`)
    continue
  }
  const localIds = new Set()
  for (const id of goal.requirementIds) {
    if (localIds.has(id)) errors.push(`goals.${goal.slug ?? goal.id}: duplicate requirement id "${id}"`)
    localIds.add(id)
    if (!requirementIdSet.has(id)) errors.push(`goals.${goal.slug ?? goal.id}: unknown requirement id "${id}"`)
    goalRequirementIds.add(id)
  }
}
for (const requirement of requirements) {
  if (!goalRequirementIds.has(requirement.id)) errors.push(`requirement ${requirement.id} is not linked to a goal`)
  if (!(goals.find((goal) => goal.id === requirement.goalId)?.requirementIds ?? []).includes(requirement.id)) {
    errors.push(`requirement ${requirement.id} is missing from its primary goal`)
  }
}
errors.push(...requirementEvidenceIssues(requirements, requirementSources, today))
const validRequirementSources = requirementSources.filter((source) =>
  source && typeof source === 'object' && !Array.isArray(source),
)
const requirementSourceIds = new Set(validRequirementSources.map((source) => source.id))
if (requirementSourceIds.size !== validRequirementSources.length) errors.push('requirementSources: duplicate id')
for (const [index, source] of requirementSources.entries()) {
  if (!source || typeof source !== 'object' || Array.isArray(source)) {
    errors.push(`requirementSources[${index}]: invalid source record`)
    continue
  }
  const sourceLabel = `requirementSources.${source.id ?? index}`
  if (!['string', 'number'].includes(typeof source.id) || String(source.id).trim() === '') {
    errors.push(`${sourceLabel}: missing or invalid id`)
  }
  for (const field of ['agency', 'title', 'evidenceType', 'limitations']) {
    if (typeof source[field] !== 'string' || !source[field].trim()) {
      errors.push(`${sourceLabel}: missing ${field}`)
    }
  }
  if (!allowedSource(source.url, officialHosts)) {
    errors.push(`${sourceLabel}: source URL must use HTTPS and an allowed official host`)
  }
  if (!validDate(source.lastChecked) || source.lastChecked > today) {
    errors.push(`${sourceLabel}: invalid or future lastChecked`)
  } else if (reviewIsExpired(source.lastChecked, today)) {
    errors.push(`${sourceLabel}: source review is older than 365 days`)
  }
  if (!['verified', 'unverified', 'conflicting'].includes(source.verification)) {
    errors.push(`${sourceLabel}: invalid verification`)
  }
  errors.push(...verificationIssues({
    type: 'requirementSource',
    title: source.title,
    description: source.evidenceType,
    notes: source.limitations,
    sourceUrl: source.url,
    verification: source.verification,
    lastVerified: source.verification === 'verified' ? source.lastChecked : null,
    verificationReview: source.verificationReview,
  }, today, officialHosts).map((issue) => `${sourceLabel}: ${issue}`))
  for (const field of ['publishedDate', 'statementDate', 'effectiveDate']) {
    if (source[field] !== null && !validDate(source[field])) {
      errors.push(`${sourceLabel}: invalid ${field}`)
    }
  }
  if (!Array.isArray(source.supports) || !source.supports.length ||
      source.supports.some((claim) => typeof claim !== 'string' || !claim.trim())) {
    errors.push(`${sourceLabel}: missing or invalid supported claims`)
  }
  if (source.relatedSources !== undefined &&
      (!Array.isArray(source.relatedSources) ||
        source.relatedSources.some((url) => {
          try {
            const parsed = new URL(url)
            return parsed.protocol !== 'https:' || !parsed.hostname || parsed.username || parsed.password
          } catch {
            return true
          }
        }))) {
    errors.push(`${sourceLabel}: relatedSources must contain safe HTTPS URLs`)
  }
}
const auditCounts = getRecordCounts({
  ...Object.fromEntries(requiredCatalogs.map((name) => [name, readData(name)])),
  requirements,
})

console.table(auditedRecords.map(({ type, title, verification, sample, result }) => ({
  type, title, verification, sample: sample ? 'sample' : '', result,
})))
for (const error of errors) console.error(error)
const unverifiedCount = auditedRecords.filter((record) => record.verification === 'unverified').length
const passedCount = auditedRecords.filter((record) => record.result === 'PASS').length
console.log(`Collection counts: ${JSON.stringify(auditCounts.collections)}`)
console.log(`Total records: ${auditCounts.total}`)
console.log(`Feature catalog arrays: ${featureCatalogNames.length}; ${featureCatalogNames.filter((name) => featureCatalogs[name]?.length === 0).length} empty; no sample records added.`)
if (auditCounts.total !== auditedRecords.length) errors.push(`audit count mismatch: counted ${auditCounts.total}, audited ${auditedRecords.length}`)
console.log(`${passedCount}/${auditCounts.total} records passed; ${unverifiedCount} unverified; ${errors.length} validation errors. No data changed.`)
process.exitCode = errors.length ? 1 : 0
