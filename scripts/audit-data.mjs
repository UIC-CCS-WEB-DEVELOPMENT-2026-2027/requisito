import { readFileSync } from 'node:fs'
import process from 'node:process'
import { validBarangayDistrict, validDate, verificationIssues } from './audit-rules.mjs'

const readData = (name) =>
  JSON.parse(readFileSync(new URL(`../src/data/${name}.json`, import.meta.url), 'utf8'))

const goals = readData('goals')
const requirements = readData('requirements')
const goalIds = new Set(goals.map((goal) => goal.id))
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
    if (!goalIds.has(record.goalId)) recordErrors.push('unknown goalId')
    if (typeof record.label !== 'string' || !record.label.trim()) recordErrors.push('missing label')
    if (typeof record.copies !== 'number') recordErrors.push('invalid copies')
    if (!['unverified', 'done'].includes(record.status)) recordErrors.push('invalid status')
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
}

const requirementIds = new Set()
const requirementSlugs = new Set()
requirements.forEach((record, index) => auditRecord(record, 'requirements', index, requirementIds, requirementSlugs))

console.table(auditedRecords.map(({ type, title, verification, sample, result }) => ({
  type, title, verification, sample: sample ? 'sample' : '', result,
})))
for (const error of errors) console.error(error)
const unverifiedCount = auditedRecords.filter((record) => record.verification === 'unverified').length
const passedCount = auditedRecords.filter((record) => record.result === 'PASS').length
console.log(`${passedCount}/${auditedRecords.length} records passed; ${unverifiedCount} unverified; ${errors.length} validation errors. No data changed.`)
process.exitCode = errors.length ? 1 : 0
