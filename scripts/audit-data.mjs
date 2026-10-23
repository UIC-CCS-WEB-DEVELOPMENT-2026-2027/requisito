import { readFileSync } from 'node:fs'

const readData = (name) => JSON.parse(readFileSync(new URL(`../src/data/${name}.json`, import.meta.url), 'utf8'))
const requirements = readData('requirements')
const goalIds = new Set(readData('goals').map((goal) => goal.id))
const today = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit',
}).format(new Date())
const fields = {
  id: 'number', goalId: 'number', label: 'string', notes: 'string',
  copies: 'number', sourceUrl: 'string', lastVerified: 'string',
  status: 'string', verification: 'string',
}

// Round-trip the date because JavaScript normalizes impossible calendar dates.
function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

const rows = requirements.map((record) => {
  const problems = []
  for (const [field, type] of Object.entries(fields)) {
    if (typeof record[field] !== type) problems.push(`missing/invalid ${field}`)
  }
  if (requirements.filter((item) => item.id === record.id).length !== 1) problems.push('duplicate id')
  if (!goalIds.has(record.goalId)) problems.push('unknown goalId')
  let source
  try { source = new URL(record.sourceUrl) } catch { /* Report invalid URLs below. */ }
  if (source?.protocol !== 'https:') problems.push('sourceUrl must be HTTPS')
  if (!validDate(record.lastVerified) || record.lastVerified > today) problems.push('invalid/future lastVerified')
  if (!['unverified', 'done'].includes(record.status)) problems.push('invalid status')
  if (!['verified', 'unverified', 'conflicting'].includes(record.verification)) problems.push('invalid verification')
  if (record.verification === 'verified') {
    if (!source?.hostname.endsWith('.gov.ph')) problems.push('verified source must end with .gov.ph')
    if (/\b(sample|placeholder|fictional)\b/i.test(record.notes)) problems.push('verified notes contain fictional markers')
  }
  return {
    id: record.id, result: problems.length ? 'FAIL' : 'PASS',
    verification: problems.length ? 'unverified (audit)' : record.verification,
    problems: problems.join('; ') || 'none',
  }
})
console.table(rows)
const failed = rows.filter((row) => row.result === 'FAIL').length
console.log(`${rows.length - failed} PASS; ${failed} FAIL. No data changed by this audit.`)
process.exitCode = failed ? 1 : 0
