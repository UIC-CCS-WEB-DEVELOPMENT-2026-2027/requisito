import test from 'node:test'
import assert from 'node:assert/strict'
import { routeManifest, href, routeMatches, adminRoutes } from '../src/routeManifest.js'
import { getFeatureRecords, getVerifiedGuides } from '../src/data/helpers.js'
import { getPageContext } from '../src/utils/pageContext.js'

test('route manifest has unique IDs and unique concrete route patterns', () => {
  const ids = routeManifest.map((route) => route.id)
  const paths = routeManifest.filter((route) => route.path !== '*').map((route) => route.path)
  assert.equal(new Set(ids).size, ids.length)
  assert.equal(new Set(paths).size, paths.length)
  assert.ok(adminRoutes.includes('/admin/records/:type/:id'))
})

test('public guidance routes do not require a client sign-in and admin paths stay separate', () => {
  const routeById = new Map(routeManifest.map((route) => [route.id, route]))
  for (const routeId of ['goals', 'goalDetail', 'checklist', 'documents', 'documentGuide', 'search']) {
    assert.equal(routeById.get(routeId)?.access, 'public', `${routeId} should be public guidance`)
  }
  assert.ok(adminRoutes.includes('/admin'))
  assert.ok(adminRoutes.includes('/admin/review'))
  assert.ok(adminRoutes.includes('/admin/users'))
  assert.equal(routeManifest.some((route) => route.path.startsWith('/admin')), false)
  assert.equal(routeManifest.find((route) => route.id === 'checklist').smokePath, '/checklist?goal=1')
})

test('href formats named route parameters and query strings', () => {
  assert.equal(href('serviceDetail', { slug: 'central-911' }), '/services/central-911')
  assert.equal(href('districtProfile', { name: 'Talomo District' }), '/districts/Talomo%20District')
  assert.equal(href('checklist', {}, { goal: 7 }), '/checklist?goal=7')
  assert.throws(() => href('serviceDetail'), /Missing "slug"/)
  assert.throws(() => href('unknown'), /Unknown route id/)
})

test('route lookup resolves public static, dynamic and not-found paths', () => {
  assert.equal(routeMatches('/services')?.id, 'services')
  assert.equal(routeMatches('/services/central-911')?.id, 'serviceDetail')
  assert.equal(routeMatches('/reports/not-published')?.id, 'reportDetail')
  assert.equal(routeMatches('/does-not-exist'), null)
  assert.equal(routeMatches('/admin'), null)
})

test('new feature catalogs are explicit and finder only returns complete verified briefs', () => {
  for (const name of [
    'reports', 'events', 'assets', 'publicRecords', 'mapLocations', 'transitRoutes',
    'heritageSites', 'tourismPlaces', 'cinemas', 'communityTools', 'estateListings',
    'civicAuditEntries',
  ]) assert.deepEqual(getFeatureRecords(name), [])
  assert.deepEqual(getVerifiedGuides(), [])
  assert.throws(() => getFeatureRecords('unknown-catalog'), /Unknown feature catalog/)
})

test('assistant page context resolves a real service slug and ignores other paths', () => {
  assert.deepEqual(getPageContext('/services/central-911'), { type: 'hotline', slug: 'central-911' })
  assert.equal(getPageContext('/services/not-a-record'), null)
  assert.equal(getPageContext('/officials/mayor'), null)
})
