import test from 'node:test'
import assert from 'node:assert/strict'
import {
  BARANGAY_DISTRICT_COUNTS,
  BARANGAY_LEGISLATIVE_DISTRICTS,
  allowedSource,
  barangayCatalogIssues,
  validBarangayDistrict,
  validDate,
  verificationIssues,
} from './audit-rules.mjs'

test('audit source rule accepts HTTPS government domains and explicit allowlist hosts', () => {
  assert.equal(allowedSource('https://davaocity.gov.ph/services'), true)
  assert.equal(allowedSource('https://office.example.org/', ['office.example.org']), true)
  assert.equal(allowedSource('http://davaocity.gov.ph/'), false)
  assert.equal(allowedSource('https://davaocity.gov.ph.attacker.invalid/'), false)
})

test('audit rejects invalid and future dates plus unsubstantiated verified records', () => {
  assert.equal(validDate('2026-10-23'), true)
  assert.equal(validDate('2026-02-30'), false)
  const base = {
    title: 'Office service',
    description: 'Service description',
    notes: 'Current service details',
    sourceUrl: 'https://davaocity.gov.ph/',
    verification: 'verified',
    lastVerified: '2026-10-24',
  }
  assert.ok(verificationIssues(base, '2026-10-23').some(issue => issue.includes('future')))
  assert.ok(verificationIssues({ ...base, lastVerified: '2026-10-20', notes: 'fictional example' }, '2026-10-23')
    .some(issue => issue.includes('fictional')))
})

test('a fact with a source URL must use HTTPS', () => {
  const fact = {
    type: 'fact',
    title: 'Population',
    description: 'Population fact',
    notes: '',
    sourceUrl: 'http://psa.gov.ph/population',
    verification: 'unverified',
    lastVerified: null,
  }
  assert.ok(verificationIssues(fact, '2026-10-23').some((issue) => issue.includes('fact sourceUrl must be an HTTPS URL')))
  assert.equal(verificationIssues({ ...fact, sourceUrl: 'https://psa.gov.ph/population' }, '2026-10-23')
    .some((issue) => issue.includes('fact sourceUrl must be an HTTPS URL')), false)
})

test('audit requires a district from the supplied administrative list', () => {
  const districts = ['Poblacion', 'Talomo', 'Agdao', 'Buhangin', 'Bunawan', 'Paquibato', 'Baguio', 'Calinan', 'Marilog', 'Toril', 'Tugbok']
  assert.equal(validBarangayDistrict('Poblacion', districts), true)
  assert.equal(validBarangayDistrict('Invented District', districts), false)
})

test('real barangay catalog audit checks complete count, unique names/slugs, and district totals', () => {
  const records = Object.entries(BARANGAY_DISTRICT_COUNTS).flatMap(([district, count]) =>
    Array.from({ length: count }, (_, index) => ({
      type: 'barangay',
      title: `${district} ${index + 1}`,
      slug: `${district.toLowerCase()}-${index + 1}`,
      adminDistrict: district,
      legislativeDistrict: BARANGAY_LEGISLATIVE_DISTRICTS[district],
      population2020: null,
      isSample: false,
      verification: 'unverified',
      lastVerified: null,
    })),
  )
  assert.equal(records.length, 182)
  assert.deepEqual(barangayCatalogIssues(records), [])

  const invalid = records.map((record) => ({ ...record }))
  invalid[1].title = invalid[0].title
  invalid[1].slug = invalid[0].slug
  invalid[2].legislativeDistrict = '3rd'
  assert.ok(barangayCatalogIssues(invalid).some((issue) => issue.includes('duplicate name')))
  assert.ok(barangayCatalogIssues(invalid).some((issue) => issue.includes('duplicate slug')))
  assert.ok(barangayCatalogIssues(invalid).some((issue) => issue.includes('legislative district')))
  assert.ok(barangayCatalogIssues(records.slice(0, -1)).some((issue) => issue.includes('expected 182 real records')))
})
