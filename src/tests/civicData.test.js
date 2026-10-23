import test from 'node:test'
import assert from 'node:assert/strict'
import {
  getBarangayBySlug,
  getBarangays,
  getCityFacts,
  getCityMonitor,
  getDistricts,
  getHistory,
  getBriefs,
  getBudget,
  getProcurement,
  getElections,
  getAccountability,
  getOfficials,
  getServiceBySlug,
  getServices,
  getServicesByCategory,
  getStatusReport,
  getSourceWatchStatus,
  getUpdates,
  searchAll,
  STALE_DAYS,
} from '../data/helpers.js'

test('service helpers return isolated records and category-filtered results', () => {
  const service = getServiceBySlug('central-911')
  assert.equal(service.title, 'Central 911')
  assert.equal(getServices().length, 7)
  service.contact.phone.push('not persisted')
  assert.equal(getServiceBySlug('central-911').contact.phone.includes('not persisted'), false)
  assert.ok(getServicesByCategory('Health').every(item => item.category === 'Health'))
  assert.equal(getServiceBySlug('missing'), null)
})

test('barangay helpers include only marked sample fixtures until official data is imported', () => {
  const records = getBarangays()
  assert.equal(records.length, 6)
  assert.ok(records.every(item => item.isSample && item.verification === 'unverified'))
  assert.equal(getBarangayBySlug('sample-barangay-a').adminDistrict, 'Poblacion')
  assert.equal(getDistricts().length, 11)
})

test('facts, offices, and dated updates remain unverified source records', () => {
  assert.equal(getCityFacts().length, 5)
  assert.equal(getOfficials().length, 3)
  assert.ok(getOfficials().every(item => item.holderName === null && item.lastVerified === null))
  assert.equal(getUpdates().length, 2)
  assert.ok(getUpdates().every(item => item.verification === 'unverified'))
})

test('search trims and lowercases query, groups results, and omits sample barangays', () => {
  const results = searchAll('  CENTRAL 911 ')
  assert.deepEqual(Object.keys(results), [
    'services', 'barangays', 'requirements', 'updates', 'history', 'briefs',
    'budget', 'procurement', 'elections', 'accountability',
  ])
  assert.equal(results.services.length, 1)
  assert.equal(results.services[0].title, 'Central 911')
  assert.equal(Object.values(searchAll('sample barangay a')).flat().length, 0)
  assert.equal(Object.values(searchAll('   ')).flat().length, 0)
  assert.equal(searchAll('health card').briefs.length, 1)
})

test('Part 2 catalogs preserve empty data states and exclude samples from monitor counts', () => {
  assert.deepEqual(getHistory(), [])
  assert.equal(getBriefs().length, 3)
  assert.deepEqual(getBudget(), [])
  assert.deepEqual(getProcurement(), [])
  assert.deepEqual(getAccountability(), [])
  assert.equal(getElections()[0].verification, 'unverified')
  assert.equal(getSourceWatchStatus().lastChecked, null)
  const monitor = getCityMonitor()
  assert.equal(monitor.verificationCounts.barangays.unverified, 0)
  assert.equal(monitor.sourceWatch.lastChecked, null)
})

test('status report derives verification, stale, time-sensitive, and gap records', () => {
  const report = getStatusReport(new Date('2026-10-23T00:00:00Z'))
  assert.equal(STALE_DAYS, 90)
  assert.equal(report.verificationCounts.barangays.unverified, 0)
  assert.ok(report.verificationCounts.services.unverified > 0)
  assert.ok(report.timeSensitive.some(record => record.title === 'Health card'))
  assert.ok(report.knownGaps.every(record => record.verification !== 'verified'))
})
