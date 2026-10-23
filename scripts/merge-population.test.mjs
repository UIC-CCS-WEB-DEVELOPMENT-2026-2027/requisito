import test from 'node:test'
import assert from 'node:assert/strict'
import {
  createPopulationReport,
  mergePopulationRecords,
  normalizeBarangayName,
  parsePopulation,
  parsePopulationCsv,
} from './merge-population.mjs'

test('population matching normalizes accents, barangay prefixes, abbreviations, and numbered names', () => {
  assert.equal(normalizeBarangayName('Barangay 1-A'), normalizeBarangayName('Brgy. 1-A (Pob.)'))
  assert.equal(normalizeBarangayName('Catalunan Pequeño'), normalizeBarangayName('Catalunan Pequeno'))
  assert.equal(normalizeBarangayName('Santo Niño'), normalizeBarangayName('Santo Nino'))
})

test('population parser accepts comma/space separated non-negative integers only', () => {
  assert.equal(parsePopulation('80, 538', 2), 80538)
  assert.throws(() => parsePopulation('-1', 2), /non-negative integer/)
  assert.throws(() => parsePopulation('1.5', 2), /non-negative integer/)
  assert.throws(() => parsePopulation('', 2), /non-negative integer/)
})

test('population report matches normalized exact names and exposes unmatched rows without fuzzy matching', () => {
  const locals = [
    { title: 'Barangay 1-A', slug: 'barangay-1-a' },
    { title: 'Bucana', slug: 'bucana' },
  ]
  const psa = parsePopulationCsv([
    'name,population2020',
    '"Brgy. 1-A (Pob.)","1,234"',
    'Bucana Norte,100',
  ].join('\n'))
  const report = createPopulationReport(locals, psa)

  assert.deepEqual(report.matched.map(({ name, population2020 }) => ({ name, population2020 })), [
    { name: 'Barangay 1-A', population2020: 1234 },
  ])
  assert.deepEqual(report.localOnly, ['Bucana'])
  assert.deepEqual(report.psaOnly, ['Bucana Norte'])
})

test('population report does not match ambiguous duplicate normalized names', () => {
  const locals = [{ title: 'Santo Niño', slug: 'santo-nino' }]
  const psa = parsePopulationCsv([
    'name,population2020',
    'Santo Nino,10',
    'Santo Niño,20',
  ].join('\n'))
  const report = createPopulationReport(locals, psa)
  assert.equal(report.matched.length, 0)
  assert.deepEqual(report.localOnly, ['Santo Niño'])
  assert.deepEqual(report.psaOnly, ['Santo Nino', 'Santo Niño'])
})

test('population merge refuses partial writes unless explicitly allowed and leaves unmatched values null', () => {
  const locals = [
    { title: 'Bucana', slug: 'bucana', population2020: null, verification: 'unverified', lastVerified: null },
    { title: 'Bago Aplaya', slug: 'bago-aplaya', population2020: null, verification: 'unverified', lastVerified: null },
  ]
  const psa = parsePopulationCsv('name,population2020\nBucana,80538')
  const report = createPopulationReport(locals, psa)
  assert.throws(() => mergePopulationRecords(locals, report), /exactly 182 are required/)

  const merged = mergePopulationRecords(locals, report, true)
  assert.equal(merged[0].population2020, 80538)
  assert.equal(merged[1].population2020, null)
  assert.equal(merged[0].verification, 'unverified')
  assert.equal(merged[0].lastVerified, null)
  assert.equal(locals[0].population2020, null)
})
