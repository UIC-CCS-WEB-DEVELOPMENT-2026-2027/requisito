import test from 'node:test'
import assert from 'node:assert/strict'
import { parseBarangayCsv } from './import-barangays.mjs'

const csv = (rows) => [
  'name,adminDistrict,legislativeDistrict,population2020,sourceUrl',
  ...rows,
].join('\n')

test('barangay importer allows blank populations and keeps every imported row unverified', () => {
  const result = parseBarangayCsv(csv([
    'Álpha,Poblacion,1st,,https://psa.gov.ph/source.xlsx',
    'Alpha!,Talomo,1st,125,https://psa.gov.ph/source.xlsx',
    'Santo Niño,Tugbok,3rd,,https://psa.gov.ph/source.xlsx',
  ]))

  assert.equal(result.records.length, 3)
  assert.equal(result.records[0].population2020, null)
  assert.equal(result.records[1].population2020, 125)
  assert.deepEqual(result.records.map((record) => record.slug), ['alpha', 'alpha-2', 'santo-nino'])
  assert.match(result.warnings[0], /numeric suffix/)
  assert.equal(result.blankPopulationCount, 2)
  assert.deepEqual(result.districtCounts, {
    Poblacion: 1, Talomo: 1, Agdao: 0, Buhangin: 0, Bunawan: 0, Paquibato: 0,
    Baguio: 0, Calinan: 0, Marilog: 0, Toril: 0, Tugbok: 1,
  })
  assert.ok(result.records.every((record) =>
    record.verification === 'unverified' &&
    record.lastVerified === null &&
    record.isSample === false &&
    record.notes.includes('secondary list'),
  ))
})

test('barangay importer rejects unknown and mismatched districts, duplicate names, and invalid population', () => {
  assert.throws(() => parseBarangayCsv(csv(['Alpha,Unknown,1st,,'])), /unknown administrative district/)
  assert.throws(() => parseBarangayCsv(csv(['Alpha,Poblacion,2nd,,'])), /belongs to the 1st legislative district/)
  assert.throws(() => parseBarangayCsv(csv(['Alpha,Poblacion,1st,,', 'Alpha,Talomo,1st,,'])), /duplicate barangay name/)
  assert.throws(() => parseBarangayCsv(csv(['Alpha,Poblacion,1st,-1,'])), /non-negative whole number/)
})
