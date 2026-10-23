import test from 'node:test'
import assert from 'node:assert/strict'
import { filterServices, sortServices } from '../utils/serviceFilters.js'

const services = [
  { id: 1, title: 'City Health Office', description: 'Public health information', category: 'Health', verification: 'verified', timeSensitive: false },
  { id: 2, title: 'Central 911', description: 'Emergency call service', category: 'Emergency', verification: 'unverified', timeSensitive: true },
  { id: 3, title: 'Health Card', description: 'Employee health card information', category: 'Health', verification: 'conflicting', timeSensitive: true },
  { id: 4, title: 'Business Bureau', description: 'Permit information', category: 'Business and Permits', verification: 'unverified', timeSensitive: false },
]

test('service search matches title and description without case sensitivity', () => {
  assert.deepEqual(filterServices(services, { query: '  hEaLtH ' }).map((service) => service.id), [1, 3])
  assert.deepEqual(filterServices(services, { query: 'call service' }).map((service) => service.id), [2])
})

test('service search returns no results when nothing matches', () => {
  assert.deepEqual(filterServices(services, { query: 'not in the catalog' }), [])
})

test('spaces-only service search behaves like no search', () => {
  assert.deepEqual(filterServices(services, { query: '   \t ' }), services)
})

test('service category filter returns only the selected category', () => {
  assert.deepEqual(
    filterServices(services, { category: 'Health' }).map((service) => service.id),
    [1, 3],
  )
})

test('verification status sorting uses unverified, verified, then conflicting order', () => {
  assert.deepEqual(sortServices(services, 'status').map((service) => service.id), [4, 2, 1, 3])
})

test('time-sensitive sorting puts urgent services first', () => {
  assert.deepEqual(sortServices(services, 'time-sensitive').map((service) => service.id), [2, 3, 4, 1])
})

test('title sorting is alphabetical', () => {
  assert.deepEqual(sortServices(services, 'title').map((service) => service.id), [4, 2, 1, 3])
})

test('service sorting returns a copy and leaves the input unchanged', () => {
  const originalOrder = services.map((service) => service.id)
  const sorted = sortServices(services, 'title')

  assert.notEqual(sorted, services)
  assert.deepEqual(services.map((service) => service.id), originalOrder)
})

test('service filtering can be combined with sorting', () => {
  const filtered = filterServices(services, { query: 'health', category: 'Health' })

  assert.deepEqual(sortServices(filtered, 'title').map((service) => service.id), [1, 3])
})
