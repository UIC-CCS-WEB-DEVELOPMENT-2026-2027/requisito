import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { parseNonNegativeAmount, recordsFromCsv, requireHttpsOrBlank, slugify, validIsoDate } from './csv-utils.mjs'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const headers = ['referenceNo', 'title', 'agency', 'amountPHP', 'awardDate', 'status', 'sourceUrl']

export function parseProcurementCsv(text) {
  const records = recordsFromCsv(text, headers, (row, line) => {
    if (!row.referenceNo || !row.title || !row.agency || !row.status) {
      throw new Error(`Line ${line}: referenceNo, title, agency, and status are required.`)
    }
    if (row.awardDate && !validIsoDate(row.awardDate)) {
      throw new Error(`Line ${line}: awardDate must be YYYY-MM-DD or blank.`)
    }
    const suffix = slugify(row.referenceNo)
    if (!suffix) throw new Error(`Line ${line}: referenceNo must contain letters or numbers.`)
    return {
      id: `procurement-${suffix}`,
      slug: suffix,
      type: 'procurement',
      title: row.title,
      description: `Procurement record ${row.referenceNo}.`,
      category: 'Procurement',
      referenceNo: row.referenceNo,
      agency: row.agency,
      amountPHP: parseNonNegativeAmount(row.amountPHP, 'amountPHP', line),
      awardDate: row.awardDate || null,
      status: row.status,
      sourceUrl: requireHttpsOrBlank(row.sourceUrl, 'sourceUrl', line),
      lastVerified: null,
      verification: 'unverified',
      timeSensitive: false,
      notes: 'Imported from supplied CSV; requires review against an official source.',
      isSample: false,
    }
  })
  const refs = new Set()
  for (const record of records) {
    if (refs.has(record.referenceNo)) throw new Error(`Duplicate procurement reference: ${record.referenceNo}.`)
    refs.add(record.referenceNo)
  }
  return records
}

async function main() {
  const records = parseProcurementCsv(await readFile(resolve(root, 'data-source/davao-procurement.csv'), 'utf8'))
  await writeFile(resolve(root, 'src/data/procurement.json'), `${JSON.stringify(records, null, 2)}\n`)
  console.log(`Imported ${records.length} unverified procurement rows to src/data/procurement.json.`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) await main()
