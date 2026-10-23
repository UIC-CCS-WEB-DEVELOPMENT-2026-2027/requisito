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
  getSummaryCounts,
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

test('barangay helpers return the sourced-name list with blank populations and unverified status', () => {
  const records = getBarangays()
  assert.equal(records.length, 182)
  assert.ok(records.every(item =>
    item.isSample === false &&
    item.verification === 'unverified' &&
    item.lastVerified === null &&
    item.population2020 === null,
  ))
  assert.equal(getBarangayBySlug('barangay-1-a').adminDistrict, 'Poblacion')
  assert.equal(getBarangayBySlug('kap-tomas-monteverde-sr').adminDistrict, 'Agdao')
  assert.equal(getDistricts().length, 11)
})

test('facts, offices, and dated updates remain unverified source records', () => {
  assert.equal(getCityFacts().length, 7)
  assert.equal(getOfficials().length, 3)
  assert.ok(getOfficials().every(item => item.holderName === null && item.lastVerified === null))
  assert.equal(getUpdates().length, 2)
  assert.ok(getUpdates().every(item => item.verification === 'unverified'))
})

test('search trims and lowercases query, groups results, and finds real barangays', () => {
  const results = searchAll('  CENTRAL 911 ')
  assert.deepEqual(Object.keys(results), [
    'services', 'barangays', 'requirements', 'updates', 'history', 'briefs',
    'budget', 'procurement', 'elections', 'accountability', 'districts',
  ])
  assert.equal(results.services.length, 1)
  assert.equal(results.services[0].title, 'Central 911')
  assert.equal(searchAll('bucana').barangays[0].title, 'Bucana')
  assert.equal(searchAll('district').districts.length, 11)
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
  assert.equal(monitor.verificationCounts.barangays.unverified, 182)
  assert.equal(monitor.sourceWatch.lastChecked, null)
})

test('status report derives verification, stale, time-sensitive, and gap records', () => {
  const report = getStatusReport(new Date('2026-10-23T00:00:00Z'))
  assert.equal(STALE_DAYS, 90)
  assert.equal(report.verificationCounts.barangays.unverified, 182)
  assert.ok(report.verificationCounts.services.unverified > 0)
  assert.ok(report.timeSensitive.some(record => record.title === 'Health card'))
  assert.ok(report.knownGaps.every(record => record.verification !== 'verified'))
})

test('dashboard total shares the audit scope and its unverified count matches status gaps', () => {
  const counts = getSummaryCounts()
  assert.equal(counts.total, Object.values(counts.collections).reduce((total, count) => total + count, 0))
  assert.equal(counts.unverified, getStatusReport().knownGaps.length)
  assert.equal(counts.goals, 7)
})
