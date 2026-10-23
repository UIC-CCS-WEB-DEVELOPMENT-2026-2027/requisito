import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { recordsFromCsv, slugify } from './csv-utils.mjs'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const sourcePath = resolve(root, 'data-source/davao-barangays.csv')
const destinationPath = resolve(root, 'src/data/barangays.json')
const expectedHeaders = ['name', 'adminDistrict', 'legislativeDistrict', 'population2020', 'sourceUrl']
const legislativeDistrictByAdmin = {
  Poblacion: '1st',
  Talomo: '1st',
  Agdao: '2nd',
  Buhangin: '2nd',
  Bunawan: '2nd',
  Paquibato: '2nd',
  Baguio: '3rd',
  Calinan: '3rd',
  Marilog: '3rd',
  Toril: '3rd',
  Tugbok: '3rd',
}
const importNote = "Name and district compiled from a secondary list; check against the PSA workbook and the city's official district list."

function optionalPopulation(value, line) {
  if (!value) return null
  const population = Number(value)
  if (!Number.isSafeInteger(population) || population < 0) {
    throw new Error(`Line ${line}: population2020 must be a non-negative whole number or blank.`)
  }
  return population
}

export function parseBarangayCsv(csv) {
  const slugs = new Set()
  const names = new Set()
  const warnings = []
  const records = recordsFromCsv(csv, expectedHeaders, (row, line) => {
    const name = row.name.trim()
    const adminDistrict = row.adminDistrict.trim()
    const legislativeDistrict = row.legislativeDistrict.trim()
    if (!name) throw new Error(`Line ${line}: barangay name is required.`)
    if (!Object.hasOwn(legislativeDistrictByAdmin, adminDistrict)) {
      throw new Error(`Line ${line}: unknown administrative district "${adminDistrict}".`)
    }
    if (!['1st', '2nd', '3rd'].includes(legislativeDistrict)) {
      throw new Error(`Line ${line}: legislativeDistrict must be 1st, 2nd, or 3rd.`)
    }
    if (legislativeDistrict !== legislativeDistrictByAdmin[adminDistrict]) {
      throw new Error(`Line ${line}: ${adminDistrict} belongs to the ${legislativeDistrictByAdmin[adminDistrict]} legislative district, not ${legislativeDistrict}.`)
    }
    if (names.has(name)) throw new Error(`Line ${line}: duplicate barangay name "${name}".`)
    names.add(name)

    const baseSlug = slugify(name)
    if (!baseSlug) throw new Error(`Line ${line}: barangay name does not produce a usable slug.`)
    let slug = baseSlug
    let suffix = 2
    while (slugs.has(slug)) {
      if (suffix === 2) warnings.push(`Line ${line}: "${name}" shares slug "${baseSlug}"; using a numeric suffix.`)
      slug = `${baseSlug}-${suffix}`
      suffix += 1
    }
    slugs.add(slug)

    const sourceUrl = row.sourceUrl.trim()
    if (sourceUrl && !/^https:\/\//i.test(sourceUrl)) {
      throw new Error(`Line ${line}: sourceUrl must be HTTPS or blank.`)
    }

    return {
      id: `barangay-${slug}`,
      slug,
      type: 'barangay',
      title: name,
      description: 'Barangay name and district compiled from a secondary list; confirm against official sources.',
      category: 'Barangay',
      sourceUrl,
      lastVerified: null,
      verification: 'unverified',
      timeSensitive: false,
      notes: importNote,
      adminDistrict,
      legislativeDistrict,
      population2020: optionalPopulation(row.population2020.trim(), line),
      isSample: false,
    }
  })

  const districtCounts = Object.fromEntries(
    Object.keys(legislativeDistrictByAdmin).map((district) => [
      district,
      records.filter((record) => record.adminDistrict === district).length,
    ]),
  )
  return {
    records,
    warnings,
    districtCounts,
    blankPopulationCount: records.filter((record) => record.population2020 === null).length,
  }
}

export async function importBarangays() {
  const csv = await readFile(sourcePath, 'utf8')
  const result = parseBarangayCsv(csv)
  await writeFile(destinationPath, `${JSON.stringify(result.records, null, 2)}\n`)
  for (const warning of result.warnings) console.warn(warning)
  console.log(`Imported ${result.records.length} barangays; ${result.blankPopulationCount} have blank population2020.`)
  for (const [district, count] of Object.entries(result.districtCounts)) {
    console.log(`${district}: ${count}`)
  }
  return result
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  await importBarangays()
}
