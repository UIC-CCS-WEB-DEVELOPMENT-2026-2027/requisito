import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { recordsFromCsv } from './csv-utils.mjs'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const psaPath = resolve(root, 'data-source/psa-davao-population.csv')
const barangaysPath = resolve(root, 'src/data/barangays.json')
const OFFICIAL_CITY_POPULATION = 1_776_949

// Remove source abbreviations and prefixes before comparing either name.
export function normalizeBarangayName(value) {
  // Lowercase and fold accents so names like Pequeño compare with Pequeno.
  let normalized = value.toLowerCase().normalize('NFD')
  normalized = normalized.replace(/[\u0300-\u036f]/g, '')
  // Strip common PSA display prefixes/suffixes and the local Barangay prefix.
  normalized = normalized.replace(/\(\s*pob\.\s*\)|\bpob\.|\bbrgy\./gi, ' ')
  normalized = normalized.replace(/\bbarangay\b/gi, ' ')
  // Turn punctuation, including the hyphen in 1-A, into spaces without dropping digits or letters.
  normalized = normalized.replace(/[^a-z0-9]+/g, ' ')
  // Collapse whitespace so equivalent names have one exact comparison key.
  return normalized.trim().replace(/\s+/g, ' ')
}

export function parsePopulation(value, line) {
  const digits = value.replace(/[,\s]/g, '')
  if (!/^\d+$/.test(digits)) {
    throw new Error(`Line ${line}: population2020 must be a non-negative integer.`)
  }
  const population = Number(digits)
  if (!Number.isSafeInteger(population)) {
    throw new Error(`Line ${line}: population2020 must be a safe non-negative integer.`)
  }
  return population
}

export function parsePopulationCsv(csv) {
  return recordsFromCsv(csv, ['name', 'population2020'], (row, line) => {
    const name = row.name.trim()
    if (!name) throw new Error(`Line ${line}: barangay name is required.`)
    const normalizedName = normalizeBarangayName(name)
    if (!normalizedName) throw new Error(`Line ${line}: barangay name must contain letters or numbers.`)
    return { name, normalizedName, population2020: parsePopulation(row.population2020, line) }
  })
}

export function createPopulationReport(barangays, psaRows) {
  const localByName = new Map()
  const psaByName = new Map()
  for (const record of barangays) {
    const key = normalizeBarangayName(record.title)
    localByName.set(key, [...(localByName.get(key) ?? []), record])
  }
  for (const record of psaRows) {
    psaByName.set(record.normalizedName, [...(psaByName.get(record.normalizedName) ?? []), record])
  }

  const matched = []
  const localOnly = []
  const psaOnly = []
  for (const [key, localRecords] of localByName) {
    const psaRecords = psaByName.get(key) ?? []
    if (localRecords.length === 1 && psaRecords.length === 1) {
      matched.push({
        slug: localRecords[0].slug,
        name: localRecords[0].title,
        psaName: psaRecords[0].name,
        population2020: psaRecords[0].population2020,
      })
    } else {
      localOnly.push(...localRecords.map((record) => record.title))
      if (psaRecords.length) psaOnly.push(...psaRecords.map((record) => record.name))
    }
  }
  for (const [key, psaRecords] of psaByName) {
    if (!localByName.has(key)) psaOnly.push(...psaRecords.map((record) => record.name))
  }
  return { matched, localOnly, psaOnly }
}

export function mergePopulationRecords(barangays, report, allowPartial = false) {
  if (!allowPartial && (barangays.length !== 182 || report.matched.length !== 182)) {
    throw new Error(`Refusing to write: ${report.matched.length} barangays matched; exactly 182 are required. Use --allow-partial to write only matched rows.`)
  }
  const bySlug = new Map(report.matched.map((record) => [record.slug, record.population2020]))
  return barangays.map((record) => ({
    ...record,
    population2020: bySlug.has(record.slug) ? bySlug.get(record.slug) : null,
  }))
}

function printReport(report, barangayCount) {
  console.log(`Matched (${report.matched.length}):`)
  for (const record of report.matched) console.log(`  ${record.name} <- ${record.psaName}: ${record.population2020}`)
  console.log(`In our data but not uniquely matched in PSA (${report.localOnly.length}):`)
  for (const name of report.localOnly) console.log(`  ${name}`)
  console.log(`In the PSA file but not uniquely matched in our data (${report.psaOnly.length}):`)
  for (const name of report.psaOnly) console.log(`  ${name}`)
  const populationSum = report.matched.reduce((total, record) => total + record.population2020, 0)
  console.log(`Sum of matched populations (${barangayCount} total local records): ${populationSum.toLocaleString('en-US')}`)
  console.log(`Difference from official City of Davao 2020 total (${OFFICIAL_CITY_POPULATION.toLocaleString('en-US')}): ${(populationSum - OFFICIAL_CITY_POPULATION).toLocaleString('en-US')}`)
}

export async function runPopulationMerge(args = process.argv.slice(2)) {
  const write = args.includes('--write')
  const allowPartial = args.includes('--allow-partial')
  const psaRows = parsePopulationCsv(await readFile(psaPath, 'utf8'))
  const barangays = JSON.parse(await readFile(barangaysPath, 'utf8'))
  const report = createPopulationReport(barangays, psaRows)
  printReport(report, barangays.length)
  if (!write) {
    console.log('Dry run only; no data changed. Pass --write to write an eligible merge.')
    return report
  }
  const merged = mergePopulationRecords(barangays, report, allowPartial)
  await writeFile(barangaysPath, `${JSON.stringify(merged, null, 2)}\n`)
  console.log(`Wrote population values for ${report.matched.length} matched barangays.`)
  return report
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  await runPopulationMerge()
}
