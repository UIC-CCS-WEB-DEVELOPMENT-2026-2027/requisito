import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const sourcePath = resolve(root, 'data-source/davao-barangays.csv')
const destinationPath = resolve(root, 'src/data/barangays.json')
const districts = new Set([
  'Poblacion', 'Talomo', 'Agdao', 'Buhangin', 'Bunawan', 'Paquibato',
  'Baguio', 'Calinan', 'Marilog', 'Toril', 'Tugbok',
])
const expectedHeaders = ['name', 'adminDistrict', 'legislativeDistrict', 'population2020', 'sourceUrl']

function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]
    if (character === '"' && quoted && text[index + 1] === '"') {
      field += '"'
      index += 1
    } else if (character === '"') {
      quoted = !quoted
    } else if (character === ',' && !quoted) {
      row.push(field)
      field = ''
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && text[index + 1] === '\n') index += 1
      row.push(field)
      if (row.some((value) => value.trim())) rows.push(row)
      row = []
      field = ''
    } else {
      field += character
    }
  }
  if (quoted) throw new Error('CSV contains an unclosed quoted field.')
  row.push(field)
  if (row.some((value) => value.trim())) rows.push(row)
  return rows
}

function slugify(value) {
  return value.normalize('NFKD').toLowerCase().replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function parseOptionalNumber(value, field, lineNumber) {
  if (!value.trim()) return null
  const number = Number(value)
  if (!Number.isSafeInteger(number) || number < 0) {
    throw new Error(`Line ${lineNumber}: ${field} must be a non-negative whole number or blank.`)
  }
  return number
}

const csv = await readFile(sourcePath, 'utf8')
const rows = parseCsv(csv.replace(/^\uFEFF/, ''))
if (rows.length < 2) throw new Error('CSV must include the required header and at least one barangay row.')

const headers = rows[0].map((value) => value.trim())
if (headers.length !== expectedHeaders.length || expectedHeaders.some((field, index) => headers[index] !== field)) {
  throw new Error(`CSV headers must be exactly: ${expectedHeaders.join(', ')}.`)
}

const records = rows.slice(1).map((values, index) => {
  const lineNumber = index + 2
  if (values.length !== headers.length) throw new Error(`Line ${lineNumber}: expected ${headers.length} columns.`)
  const record = Object.fromEntries(headers.map((header, column) => [header, values[column].trim()]))
  const name = record.name
  const slug = slugify(name)
  if (!name || !slug) throw new Error(`Line ${lineNumber}: barangay name is required.`)
  if (!districts.has(record.adminDistrict)) {
    throw new Error(`Line ${lineNumber}: adminDistrict must match one of the eleven configured district names.`)
  }
  if (record.sourceUrl && !/^https:\/\//i.test(record.sourceUrl)) {
    throw new Error(`Line ${lineNumber}: sourceUrl must be HTTPS or blank.`)
  }
  return {
    id: `barangay-${slug}`,
    slug,
    type: 'barangay',
    title: name,
    description: 'Barangay listing imported from the supplied source CSV.',
    category: 'Barangay',
    sourceUrl: record.sourceUrl,
    lastVerified: null,
    verification: 'unverified',
    timeSensitive: false,
    notes: 'Imported from supplied CSV; requires review against official source data.',
    adminDistrict: record.adminDistrict,
    legislativeDistrict: parseOptionalNumber(record.legislativeDistrict, 'legislativeDistrict', lineNumber),
    population2020: parseOptionalNumber(record.population2020, 'population2020', lineNumber),
    isSample: false,
  }
})

const seen = new Set()
for (const record of records) {
  if (seen.has(record.slug)) throw new Error(`Duplicate barangay name/slug: ${record.title}.`)
  seen.add(record.slug)
}

await writeFile(destinationPath, `${JSON.stringify(records, null, 2)}\n`)
console.log(`Imported ${records.length} unverified barangay records to src/data/barangays.json.`)
