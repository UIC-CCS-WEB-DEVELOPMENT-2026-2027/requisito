import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { getRecordCounts } from '../src/data/recordCounts.js'

const root = fileURLToPath(new URL('..', import.meta.url))
const collectionNames = [
  'services', 'barangays', 'officials', 'cityFacts', 'updates', 'history',
  'budget', 'procurement', 'briefs', 'elections', 'accountability', 'requirements',
]

test('collection counts sum to the centralized total and match the audit total', () => {
  const collections = Object.fromEntries(collectionNames.map((name) => [
    name,
    JSON.parse(readFileSync(new URL(`../src/data/${name}.json`, import.meta.url), 'utf8')),
  ]))
  const counts = getRecordCounts(collections)
  assert.equal(Object.values(counts.collections).reduce((sum, count) => sum + count, 0), counts.total)

  const audit = spawnSync(process.execPath, ['scripts/audit-data.mjs'], {
    cwd: root,
    encoding: 'utf8',
  })
  assert.equal(audit.status, 0, audit.stderr)
  assert.match(audit.stdout, new RegExp(`Total records: ${counts.total}\\b`))
  assert.match(audit.stdout, new RegExp(`${counts.total}/${counts.total} records passed`))
})

test('pure record counter treats missing/non-array collections as empty', () => {
  assert.deepEqual(getRecordCounts({ alpha: [1, 2], empty: [], invalid: null }), {
    collections: { alpha: 2, empty: 0, invalid: 0 },
    total: 2,
  })
})
