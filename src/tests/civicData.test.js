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
  getGoals,
  getOfficials,
  getVerifiedHotlines,
  filterVerifiedHotlines,
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
  assert.equal(getServices().length, 17)
  service.contact.phone.push('not persisted')
  assert.equal(getServiceBySlug('central-911').contact.phone.includes('not persisted'), false)
  assert.ok(getServicesByCategory('Health').every(item => item.category === 'Health'))
  assert.equal(getServiceBySlug('missing'), null)
})

test('Davao online service handoffs retain directory provenance and pending review status', () => {
  const onlineServices = getServices().filter((service) =>
    service.sourceUrl === 'https://davaocity.gov.ph/more-services/',
  )
  assert.equal(onlineServices.length, 8)
  assert.ok(onlineServices.every((service) =>
    service.sourceUrl === 'https://davaocity.gov.ph/more-services/' &&
    service.relatedSources?.length === 1 &&
    service.lastVerified === null &&
    service.verification === 'unverified' &&
    new URL(service.onlineUrl).protocol === 'https:',
  ))
  assert.equal(
    getServiceBySlug('occupational-permit').availabilityNote.includes('office-maintenance notice'),
    true,
  )
  assert.equal(getServiceBySlug('special-permit').lastVerified, null)
  const copied = getServiceBySlug('online-business-permit-and-licensing-system')
  copied.keywords.push('local mutation')
  assert.equal(
    getServiceBySlug('online-business-permit-and-licensing-system').keywords.includes('local mutation'),
    false,
  )
})

test('service fees and requirements stay source-linked, isolated, and unverified pending review', () => {
  const services = getServices()
  assert.ok(services.every((service) =>
    Array.isArray(service.feeDetails) &&
    typeof service.feesNote === 'string' &&
    service.feesNote.trim() &&
    service.lastVerified === null &&
    service.verification === 'unverified',
  ))

  const birthCertificate = getServiceBySlug('psa-birth-certificate-copy')
  assert.deepEqual(birthCertificate.feeDetails.map(({ amount }) => amount), ['₱365', '₱255'])
  assert.ok(birthCertificate.feeDetails.every((fee) => fee.sourceUrl.startsWith('https://')))
  birthCertificate.feeDetails[0].description = 'local mutation'
  birthCertificate.requirements.push('local mutation')
  assert.notEqual(getServiceBySlug('psa-birth-certificate-copy').feeDetails[0].description, 'local mutation')
  assert.equal(getServiceBySlug('psa-birth-certificate-copy').requirements.includes('local mutation'), false)

  const marriageLicense = getServiceBySlug('marriage-license')
  assert.deepEqual(marriageLicense.feeDetails.map(({ amount }) => amount), ['₱300', '₱200', '₱250'])
  assert.match(marriageLicense.notes, /inconsistent about the upper age/)
  assert.equal(marriageLicense.verification, 'unverified')
})

test('only current, approved hotline records with official sources can be featured', () => {
  const today = new Date('2026-10-23T00:00:00Z')
  const record = {
    id: 1,
    type: 'hotline',
    title: 'Emergency line',
    sourceUrl: 'https://city.gov.ph/hotline',
    lastVerified: '2026-10-01',
    verification: 'verified',
    contact: { phone: ['911'] },
  }
  const records = filterVerifiedHotlines([
    record,
    { ...record, id: 2, verification: 'unverified' },
    { ...record, id: 3, lastVerified: '2026-06-01' },
    { ...record, id: 4, sourceUrl: 'http://city.gov.ph/hotline' },
    { ...record, id: 5, type: 'service' },
    { ...record, id: 6, contact: { phone: [] } },
    { ...record, id: 7, lastVerified: '2026-10-24' },
  ], today)

  assert.deepEqual(records.map(({ id }) => id), [1])
  records[0].contact.phone.push('mutated')
  assert.deepEqual(record.contact.phone, ['911'])
  assert.deepEqual(getVerifiedHotlines(today), [])
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
  assert.equal(getUpdates().length, 5)
  assert.ok(getUpdates().every(item => item.verification === 'unverified'))
})

test('search trims and lowercases query, groups results, and finds real barangays', () => {
  const results = searchAll('  CENTRAL 911 ')
  assert.deepEqual(Object.keys(results), [
    'goals', 'services', 'barangays', 'requirements', 'sources', 'updates',
    'history', 'briefs', 'budget', 'procurement', 'elections', 'accountability',
    'districts',
  ])
  assert.equal(results.services.length, 1)
  assert.equal(results.services[0].title, 'Central 911')
  assert.equal(searchAll('bucana').barangays[0].title, 'Bucana')
  assert.equal(searchAll('district').districts.length, 11)
  assert.equal(Object.values(searchAll('   ')).flat().length, 0)
  assert.equal(searchAll('health card').briefs.length, 1)
})

test('search discovers goals, canonical guides, agencies, and their official sources', () => {
  assert.equal(searchAll('first job').goals[0].slug, 'first-job')
  const requirementResult = searchAll('SSS number').requirements[0]
  assert.equal(requirementResult.slug, 'first-job-sss-number')
  assert.deepEqual(requirementResult.sourceAgencies, ['Social Security System'])
  assert.deepEqual(requirementResult.sourceTitles, ['Be an SSS Member', 'List of Valid IDs', 'Employees'])
  assert.deepEqual(requirementResult.linkedSources.map(({ id, url }) => ({ id, url })), [
    {
      id: 'sss-become-member-faq',
      url: 'https://www.sss.gov.ph/become-an-sss-member/',
    },
    {
      id: 'sss-list-of-valid-ids',
      url: 'https://www.sss.gov.ph/list-of-valid-ids/',
    },
    {
      id: 'sss-employees-coverage',
      url: 'https://www.sss.gov.ph/employees/',
    },
  ])
  assert.equal(requirementResult.verification, 'unverified')
  const agencyResults = searchAll('Social Security System').sources
  assert.equal(agencyResults[0].id, 'sss-become-member-faq')
  assert.deepEqual(agencyResults[0].linkedRequirementSlugs, [
    'first-job-sss-number', 'social-registration-employment-status',
    'sss-existing-number', 'sss-no-existing-number', 'social-employer-onboarding',
  ])
  assert.equal(agencyResults[0].verification, 'unverified')
  assert.equal(searchAll('RA 11261').sources[0].id, 'ra11261-first-time-jobseekers-act')
  assert.doesNotThrow(() => searchAll('<script>alert(1)</script>'))
})

test('civic catalogs preserve source boundaries and exclude samples from monitor counts', () => {
  assert.deepEqual(getHistory(), [])
  assert.equal(getBriefs().length, 3)
  const budget = getBudget()
  assert.equal(budget.length, 3)
  assert.ok(budget.every(item => item.fiscalYear === 2026 && item.verification === 'unverified' && item.lastVerified === null))
  assert.equal(budget.reduce((sum, item) => sum + item.amountPHP, 0), 15846064435)
  assert.ok(budget.every(item => item.sourceUrl === 'https://davaocity.gov.ph/local-government/sp-oks-davao-citys-15-8-b-2026-budget/'))
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
  assert.equal(counts.goals, getGoals().filter(goal => !goal.isSample).length)
})
