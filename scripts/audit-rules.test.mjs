import test from 'node:test'
import assert from 'node:assert/strict'
import { allowedSource, validBarangayDistrict, validDate, verificationIssues } from './audit-rules.mjs'

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

test('audit requires a district from the supplied administrative list', () => {
  const districts = ['Poblacion', 'Talomo', 'Agdao', 'Buhangin', 'Bunawan', 'Paquibato', 'Baguio', 'Calinan', 'Marilog', 'Toril', 'Tugbok']
  assert.equal(validBarangayDistrict('Poblacion', districts), true)
  assert.equal(validBarangayDistrict('Invented District', districts), false)
})
