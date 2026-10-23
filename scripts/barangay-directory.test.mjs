import test from 'node:test'
import assert from 'node:assert/strict'
import { exportBarangaysCsv, filterAndSortBarangays } from '../src/data/barangayDirectory.js'
import { rankSearchRecords } from '../src/data/search.js'

const record = (title, options = {}) => ({
  title,
  adminDistrict: 'Poblacion',
  legislativeDistrict: '1st',
  population2020: null,
  isSample: false,
  ...options,
})

test('barangay filter returns empty inputs, matches accents, and applies district filters', () => {
  assert.deepEqual(filterAndSortBarangays([]), [])
  const records = [
    record('Catalunan Pequeño', { adminDistrict: 'Talomo', legislativeDistrict: '1st' }),
    record('Santo Niño', { adminDistrict: 'Tugbok', legislativeDistrict: '3rd' }),
    record('Fictional Sample', { isSample: true }),
  ]
  assert.deepEqual(filterAndSortBarangays(records, { query: 'pequeno' }).map((item) => item.title), ['Catalunan Pequeño'])
  assert.deepEqual(filterAndSortBarangays(records, { legislativeDistrict: '3rd' }).map((item) => item.title), ['Santo Niño'])
})

test('barangay sort keeps null populations last and resolves ties by name', () => {
  const records = [
    record('Zulu', { population2020: 9, adminDistrict: 'Talomo' }),
    record('Alpha', { population2020: 9, adminDistrict: 'Poblacion' }),
    record('Bravo'),
  ]
  assert.deepEqual(filterAndSortBarangays(records, { sortBy: 'population' }).map((item) => item.title), ['Alpha', 'Zulu', 'Bravo'])
  assert.deepEqual(filterAndSortBarangays(records, { sortBy: 'population', direction: 'desc' }).map((item) => item.title), ['Alpha', 'Zulu', 'Bravo'])
  assert.deepEqual(filterAndSortBarangays(records, { sortBy: 'district' }).map((item) => item.title), ['Alpha', 'Bravo', 'Zulu'])
})

test('barangay CSV export quotes commas, quotes, and newlines correctly', () => {
  const csv = exportBarangaysCsv([
    record('Kap. "Tomas", Sr.', {
      adminDistrict: 'Agdao, North',
      population2020: null,
      lastVerified: null,
      verification: 'unverified',
    }),
  ])
  assert.equal(csv, 'name,adminDistrict,legislativeDistrict,population2020,verification,lastVerified\r\n"Kap. ""Tomas"", Sr.","Agdao, North",1st,,unverified,')
})

test('search ranks exact, prefix, title substring, then other fields and ignores placeholders', () => {
  const records = [
    record('Bucana special', { description: 'overview' }),
    record('About the city', { description: 'Bucana is mentioned here' }),
    record('Bucana'),
    record('Central Bucana'),
    record('Sample Bucana', { isSample: true }),
    record('Placeholder listing'),
  ]
  assert.deepEqual(rankSearchRecords(records, 'BUCANA').map((item) => item.title), [
    'Bucana', 'Bucana special', 'Central Bucana', 'About the city',
  ])
  assert.deepEqual(rankSearchRecords(records, '  '), [])
  assert.deepEqual(rankSearchRecords(records, 'absent'), [])
  assert.deepEqual(rankSearchRecords([record('Catalunan Pequeño')], 'pequeno').map((item) => item.title), ['Catalunan Pequeño'])
})
