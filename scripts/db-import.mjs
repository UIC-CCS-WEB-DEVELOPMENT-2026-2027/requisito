import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { databasePathFromEnv } from '../server/config.js'
import { openDatabase } from '../server/db/openDatabase.js'
import { catalogNames, recordTypes } from '../server/db/catalogs.js'

const root = fileURLToPath(new URL('../', import.meta.url))
const dataDirectory = path.resolve(process.env.ADMIN_DATA_DIR ?? path.join(root, 'src/data'))
const db = openDatabase(databasePathFromEnv())
const now = new Date().toISOString()
let added = 0
let existing = 0

try {
  db.exec('BEGIN IMMEDIATE')
  const insert = db.prepare(`
    INSERT OR IGNORE INTO records (type, id, data, verification, last_verified, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `)
  for (const name of catalogNames) {
    const records = JSON.parse(fs.readFileSync(path.join(dataDirectory, `${name}.json`), 'utf8'))
    if (!Array.isArray(records)) throw new Error(`${name}.json must contain an array.`)
    for (const source of records) {
      if (!source || typeof source !== 'object' || !['string', 'number'].includes(typeof source.id)) {
        throw new Error(`${name}.json contains a record without a valid id.`)
      }
      if (name !== 'requirementSources' && (!source.type || !source.slug)) {
        throw new Error(`${name}.json record ${source.id} lacks type or slug.`)
      }
      const data = { ...source }
      const { type = recordTypes[name], id, verification = 'unverified', lastVerified = null } = data
      delete data.type
      delete data.id
      delete data.verification
      delete data.lastVerified
      const result = insert.run(type, String(id), JSON.stringify(data), verification, lastVerified, now)
      if (Number(result.changes) === 1) added += 1
      else existing += 1
    }
  }
  db.exec('COMMIT')
} catch (error) {
  db.exec('ROLLBACK')
  throw error
} finally {
  db.close()
}

console.log(`Database import complete: ${added} added, ${existing} already present. Existing database records were not overwritten or removed.`)
