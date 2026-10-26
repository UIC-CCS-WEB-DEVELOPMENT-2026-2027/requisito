import test from 'node:test'
import assert from 'node:assert/strict'
import { buildGoogleMapsQuery, getGoogleMapsDirectionsUrl, getGoogleMapsSearchUrl } from '../utils/maps.js'
import { getServiceBySlug } from '../data/helpers.js'

test('build google maps query keeps service names and addresses while dropping blanks', () => {
  assert.equal(
    buildGoogleMapsQuery('City Health Office', 'Magallanes Street, Davao City'),
    'City Health Office, Magallanes Street, Davao City',
  )
  assert.equal(buildGoogleMapsQuery('', 'Magallanes Street, Davao City'), 'Magallanes Street, Davao City')
  assert.equal(buildGoogleMapsQuery('   ', '   '), null)
})

test('google maps URLs are encoded and include the service destination', () => {
  const title = 'Tanggapan ng Kalusugan & Serbisyo'
  const address = 'Purok 3, Brgy. San Isidro, Davao City (malapit sa paaralan)'
  const searchUrl = new URL(getGoogleMapsSearchUrl(title, address))
  const directionsUrl = new URL(getGoogleMapsDirectionsUrl(title, address))
  const expectedQuery = `${title}, ${address}`

  assert.equal(searchUrl.origin, 'https://www.google.com')
  assert.equal(searchUrl.pathname, '/maps/search/')
  assert.equal(searchUrl.searchParams.get('api'), '1')
  assert.equal(searchUrl.searchParams.get('query'), expectedQuery)
  assert.equal(directionsUrl.origin, 'https://www.google.com')
  assert.equal(directionsUrl.pathname, '/maps/dir/')
  assert.equal(directionsUrl.searchParams.get('api'), '1')
  assert.equal(directionsUrl.searchParams.get('destination'), expectedQuery)
})

test('missing, malformed, or prose addresses do not generate map links', () => {
  assert.equal(getGoogleMapsSearchUrl('City Contact Center', ''), null)
  assert.equal(getGoogleMapsDirectionsUrl('City Contact Center', null), null)
  assert.equal(getGoogleMapsDirectionsUrl('Office', {}), null)
  assert.equal(getGoogleMapsDirectionsUrl('Office', 'javascript:alert(1)'), null)
  assert.equal(getGoogleMapsDirectionsUrl('Office', 'A January announcement listed this venue.'), null)
  assert.equal(getGoogleMapsDirectionsUrl('Office', 'Some address\nInjected line'), null)
  assert.equal(getGoogleMapsDirectionsUrl('Office', `Building ${'x'.repeat(201)}`), null)
})

test('map parameters cannot change the Google Maps destination origin', () => {
  const url = new URL(getGoogleMapsDirectionsUrl(
    'Office"><script>alert(1)</script>',
    'Davao City, Philippines',
  ))

  assert.equal(url.origin, 'https://www.google.com')
  assert.equal(url.pathname, '/maps/dir/')
  assert.equal(url.searchParams.get('destination'), 'Office"><script>alert(1)</script>, Davao City, Philippines')
})

test('catalog locations generate map links only when the address field is usable', () => {
  const central911 = getServiceBySlug('central-911')
  const businessBureau = getServiceBySlug('business-bureau')
  const cityInfo = getServiceBySlug('city-information-office')
  const cityHealth = getServiceBySlug('city-health-office')
  const contactCenter = getServiceBySlug('davao-city-contact-center')
  const healthCard = getServiceBySlug('health-card')

  assert.match(central911.contact.address, /Daang Patnubay/)
  assert.ok(getGoogleMapsDirectionsUrl(central911.title, central911.contact.address))
  assert.equal(central911.verification, 'unverified')
  assert.match(central911.sourceUrl, /^https:\/\/davaocity\.gov\.ph\//)
  assert.equal(
    businessBureau.contact.address,
    'Ground Floor, Sangguniang Panlungsod Bldg., Davao City, 8000 Philippines',
  )
  assert.deepEqual(businessBureau.contact.phone, [
    '(082) 241-1000 local 377',
    '(082) 241-1000 local 378',
  ])
  assert.equal(businessBureau.contact.hours, '8:00 AM to 5:00 PM')
  assert.ok(getGoogleMapsDirectionsUrl(businessBureau.title, businessBureau.contact.address))
  assert.equal(businessBureau.verification, 'unverified')
  assert.equal(businessBureau.lastVerified, null)
  assert.equal(businessBureau.sourceUrl, 'https://davaocity.gov.ph/business-bureau/')
  assert.match(cityInfo.contact.address, /San Pedro St\./)
  assert.ok(getGoogleMapsSearchUrl(cityInfo.title, cityInfo.contact.address))
  assert.deepEqual(cityInfo.contact.phone, ['(082) 241-1000 local 219'])
  assert.equal(cityInfo.contact.hours, '')
  assert.equal(cityInfo.verification, 'unverified')
  assert.match(cityInfo.sourceUrl, /^https:\/\/davaocity\.gov\.ph\//)
  assert.match(cityHealth.contact.address, /Magallanes Street/)
  assert.ok(getGoogleMapsDirectionsUrl(cityHealth.title, cityHealth.contact.address))
  assert.equal(cityHealth.contact.hours, '')
  assert.equal(cityHealth.verification, 'unverified')
  assert.equal(getGoogleMapsDirectionsUrl(contactCenter.title, contactCenter.contact.address), null)
  assert.equal(getGoogleMapsDirectionsUrl(healthCard.title, healthCard.contact.address), null)
  assert.equal(healthCard.verification, 'unverified')
  assert.match(healthCard.sourceUrl, /^https:\/\/davaocity\.gov\.ph\//)
})
