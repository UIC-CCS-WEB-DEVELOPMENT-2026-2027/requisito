import test from 'node:test'
import assert from 'node:assert/strict'
import { parseBudgetCsv } from './import-budget.mjs'
import { parseProcurementCsv } from './import-procurement.mjs'

test('budget importer parses CSV safely and keeps imported rows unverified', () => {
  const csv = 'fiscalYear,sector,amountPHP,sourceUrl\n2025,"Health, public services",1250.50,https://davaocity.gov.ph/budget'
  const [record] = parseBudgetCsv(csv, 2026)
  assert.equal(record.sector, 'Health, public services')
  assert.equal(record.amountPHP, 1250.5)
  assert.equal(record.verification, 'unverified')
  assert.equal(record.lastVerified, null)
  assert.throws(() => parseBudgetCsv('fiscalYear,sector,amountPHP,sourceUrl\n2025,Health,-1,', 2026), /non-negative/)
  assert.throws(() => parseBudgetCsv('fiscalYear,sector,amountPHP,sourceUrl\n2035,Health,1,', 2026), /plausible/)
})

test('procurement importer validates fields and keeps imported rows unverified', () => {
  const csv = 'referenceNo,title,agency,amountPHP,awardDate,status,sourceUrl\nREF-1,"Supply of items",City Office,100,2026-01-10,Awarded,https://davaocity.gov.ph/procurement'
  const [record] = parseProcurementCsv(csv)
  assert.equal(record.referenceNo, 'REF-1')
  assert.equal(record.amountPHP, 100)
  assert.equal(record.verification, 'unverified')
  assert.equal(record.lastVerified, null)
  assert.throws(() => parseProcurementCsv('referenceNo,title,agency,amountPHP,awardDate,status,sourceUrl\nREF-1,Title,Office,1,2026-02-31,Awarded,'), /YYYY-MM-DD/)
  assert.throws(() => parseProcurementCsv('referenceNo,title,agency,amountPHP,awardDate,status,sourceUrl\nREF-1,Title,Office,-1,,Awarded,'), /non-negative/)
})
