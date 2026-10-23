import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { databasePathFromEnv } from '../server/config.js'
import { catalogNames, recordTypesForCatalog } from '../server/db/catalogs.js'
import { openDatabase } from '../server/db/openDatabase.js'
import { restoreId } from '../server/db/records.js'

const root = fileURLToPath(new URL('../', import.meta.url))
const dataDirectory = path.resolve(process.env.ADMIN_DATA_DIR ?? path.join(root, 'src/data'))
const db = openDatabase(databasePathFromEnv())

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key])]))
  }
  return value
}

function stableJson(value) {
  return JSON.stringify(stableValue(value), null, 2) + '\n'
}

function readRecords(name) {
  return JSON.parse(fs.readFileSync(path.join(dataDirectory, `${name}.json`), 'utf8'))
}

function rowToRecord(row) {
  return {
    ...JSON.parse(row.data),
    type: row.type,
    id: restoreId(row.id),
    verification: row.verification,
    lastVerified: row.last_verified,
  }
}

function hasMatchingRecordAudit(record) {
  const entry = db.prepare(`
    SELECT action, next FROM audit_log
    WHERE record_type = ? AND record_id = ?
      AND action IN ('record.edited', 'record.edited.reset-verification', 'verification.approved')
    ORDER BY id DESC LIMIT 1
  `).get(record.type, String(record.id))
  if (!entry?.next) return false
  const next = JSON.parse(entry.next)
  const auditedRecord = entry.action === 'verification.approved' ? next.record : next
  return Boolean(auditedRecord) && stableJson(auditedRecord) === stableJson(record)
}

function createCatalog(name) {
  const types = recordTypesForCatalog(name)
  const existing = readRecords(name)
  const rows = db.prepare(`
    SELECT type, id, data, verification, last_verified
    FROM records WHERE type IN (${types.map(() => '?').join(', ')}) ORDER BY type, id
  `).all(...types)
  const dbRecords = new Map(rows.map((row) => [String(row.id), rowToRecord(row)]))
  const existingIds = new Set(existing.map((record) => String(record.id)))
  const missing = existing.filter((record) => !dbRecords.has(String(record.id)))
  if (missing.length) {
    throw new Error(`${name}.json export refused: ${missing.length} existing catalog record(s) are missing from the database.`)
  }
  const output = existing.map((record) => dbRecords.get(String(record.id)))
  const additions = rows
    .map(rowToRecord)
    .filter((record) => !existingIds.has(String(record.id)))
    .sort((left, right) => String(left.id).localeCompare(String(right.id), 'en', { numeric: true }))
  output.push(...additions)
  const oldById = new Map(existing.map((record) => [String(record.id), stableJson(record)]))
  const changedRecords = output.filter((record) => oldById.get(String(record.id)) !== stableJson(record))
  for (const record of changedRecords) {
    if (!hasMatchingRecordAudit(record)) {
      throw new Error(`${name}.json export refused: ${record.id} has no matching state-change audit entry.`)
    }
  }
  const changed = changedRecords.length
  return { output, changed }
}

const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'requisito-audit-'))
const pendingWrites = []
const originals = new Map()
const renamed = []

try {
  let changedRecords = 0
  for (const name of catalogNames) {
    const { output, changed } = createCatalog(name)
    changedRecords += changed
    const serialized = stableJson(output)
    fs.writeFileSync(path.join(tempDirectory, `${name}.json`), serialized, { mode: 0o600 })
    const destination = path.join(dataDirectory, `${name}.json`)
    const temporary = path.join(dataDirectory, `.${name}.${process.pid}.${randomBytes(6).toString('hex')}.tmp`)
    originals.set(destination, fs.readFileSync(destination))
    fs.writeFileSync(temporary, serialized, { mode: 0o600 })
    pendingWrites.push({ temporary, destination })
  }
  fs.copyFileSync(path.join(dataDirectory, 'goals.json'), path.join(tempDirectory, 'goals.json'))

  const audit = spawnSync(process.execPath, [path.join(root, 'scripts/audit-data.mjs')], {
    cwd: root,
    env: { ...process.env, AUDIT_DATA_DIR: tempDirectory },
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
  })
  if (audit.status !== 0) {
    process.stderr.write(audit.stdout)
    process.stderr.write(audit.stderr)
    throw new Error('Export refused because the project data audit failed.')
  }

  for (const item of pendingWrites) {
    fs.renameSync(item.temporary, item.destination)
    renamed.push(item.destination)
  }
  console.log(audit.stdout)
  console.log(`Export complete: ${changedRecords} record(s) differ from the current JSON catalogs.`)
} catch (error) {
  for (const destination of renamed.reverse()) {
    fs.writeFileSync(destination, originals.get(destination), { mode: 0o600 })
  }
  for (const item of pendingWrites) {
    if (fs.existsSync(item.temporary)) fs.unlinkSync(item.temporary)
  }
  throw error
} finally {
  db.close()
  fs.rmSync(tempDirectory, { recursive: true, force: true })
}
