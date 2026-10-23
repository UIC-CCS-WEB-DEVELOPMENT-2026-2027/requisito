import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { parseNonNegativeAmount, recordsFromCsv, requireHttpsOrBlank, slugify } from './csv-utils.mjs'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const headers = ['fiscalYear', 'sector', 'amountPHP', 'sourceUrl']

export function parseBudgetCsv(text, currentYear = new Date().getFullYear()) {
  const records = recordsFromCsv(text, headers, (row, line) => {
    const fiscalYear = Number(row.fiscalYear)
    if (!Number.isInteger(fiscalYear) || fiscalYear < 1900 || fiscalYear > currentYear + 5) {
      throw new Error(`Line ${line}: fiscalYear must be a plausible year.`)
    }
    if (!row.sector) throw new Error(`Line ${line}: sector is required.`)
    const slug = slugify(row.sector)
    if (!slug) throw new Error(`Line ${line}: sector must contain letters or numbers.`)
    return {
      id: `budget-${fiscalYear}-${slug}`,
      slug: `${fiscalYear}-${slug}`,
      type: 'budget',
      title: row.sector,
      description: `Budget amount listed for ${row.sector}.`,
      category: 'Budget',
      fiscalYear,
      sector: row.sector,
      amountPHP: parseNonNegativeAmount(row.amountPHP, 'amountPHP', line),
      sourceUrl: requireHttpsOrBlank(row.sourceUrl, 'sourceUrl', line),
      lastVerified: null,
      verification: 'unverified',
      timeSensitive: true,
      notes: 'Imported from supplied CSV; requires review against an official source.',
      isSample: false,
    }
  })
  const slugs = new Set()
  for (const record of records) {
    if (slugs.has(record.slug)) throw new Error(`Duplicate budget fiscal year and sector: ${record.slug}.`)
    slugs.add(record.slug)
  }
  return records
}

async function main() {
  const records = parseBudgetCsv(await readFile(resolve(root, 'data-source/davao-budget.csv'), 'utf8'))
  await writeFile(resolve(root, 'src/data/budget.json'), `${JSON.stringify(records, null, 2)}\n`)
  console.log(`Imported ${records.length} unverified budget rows to src/data/budget.json.`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) await main()
