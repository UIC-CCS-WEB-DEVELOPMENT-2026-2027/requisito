import test from 'node:test'
import assert from 'node:assert/strict'
import {
  BARANGAY_DISTRICT_COUNTS,
  BARANGAY_LEGISLATIVE_DISTRICTS,
  allowedSource,
  barangayCatalogIssues,
  requirementEvidenceIssues,
  requirementSourceCheckDateIssues,
  reviewIsExpired,
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
    verificationReview: {
      reviewedById: 2,
      requestId: 1,
      independent: true,
      reviewedAt: '2026-10-23',
      sourceAccessedOn: '2026-10-23',
      note: 'Compared current source details with the record.',
    },
  }
  assert.ok(verificationIssues(base, '2026-10-23').some(issue => issue.includes('future')))
  assert.ok(verificationIssues({ ...base, lastVerified: '2026-10-20', notes: 'fictional example' }, '2026-10-23')
    .some(issue => issue.includes('fictional')))
})

test('verified records require independent reviewer and source evidence', () => {
  const record = {
    title: 'Office service',
    description: 'Service description',
    notes: 'Current service details',
    sourceUrl: 'https://davaocity.gov.ph/',
    verification: 'verified',
    lastVerified: '2026-10-23',
  }
  assert.ok(verificationIssues(record, '2026-10-23')
    .some((issue) => issue.includes('independent review evidence')))
  assert.equal(reviewIsExpired('2025-10-22', '2026-10-23'), true)
  assert.equal(reviewIsExpired('2025-10-23', '2026-10-23'), false)
})

test('reported source dates are not treated as direct checks without unverified provenance', () => {
  const source = {
    verification: 'unverified',
    lastChecked: null,
    researchAttribution: {
      documentTitle: 'Research handoff',
      documentPages: [2, 5],
      sourceCheckDateReported: '2026-10-19',
    },
  }
  assert.deepEqual(requirementSourceCheckDateIssues(source, '2026-10-26'), [])
  assert.ok(requirementSourceCheckDateIssues({
    ...source,
    verification: 'verified',
  }, '2026-10-26').length > 0)
  assert.ok(requirementSourceCheckDateIssues({
    ...source,
    researchAttribution: { ...source.researchAttribution, sourceCheckDateReported: '2026-10-27' },
  }, '2026-10-26').length > 0)
  assert.ok(requirementSourceCheckDateIssues({
    ...source,
    researchAttribution: undefined,
  }, '2026-10-26').length > 0)
})

test('requirements need source links but do not inherit source-record review status', () => {
  const sources = [{
    id: 'agency-guidance',
    verification: 'unverified',
  }]
  const requirement = {
    id: 1,
    verification: 'verified',
    sourceIds: ['agency-guidance'],
  }
  assert.deepEqual(requirementEvidenceIssues([requirement], sources, '2026-10-23'), [])
  assert.ok(requirementEvidenceIssues([{ ...requirement, sourceIds: [] }], sources, '2026-10-23')
    .some((issue) => issue.includes('at least one linked source')))
})

test('explicit demo-only prompts may omit policy sources but cannot be marked verified', () => {
  const demoPrompt = {
    id: 99,
    type: 'requirement',
    requirementType: 'recommended',
    demoOnly: true,
    verification: 'unverified',
    sourceIds: [],
  }

  assert.deepEqual(requirementEvidenceIssues([demoPrompt], [], '2026-10-23'), [])
  assert.ok(verificationIssues({
    ...demoPrompt,
    verification: 'verified',
  }, '2026-10-23').some((issue) => issue.includes('demo-only content cannot be marked verified')))
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
