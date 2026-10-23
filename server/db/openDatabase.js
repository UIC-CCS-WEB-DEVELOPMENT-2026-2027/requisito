import fs from 'node:fs'
import path from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { schemaSql } from './schema.js'

export function openDatabase(databasePath) {
  if (databasePath !== ':memory:') {
    fs.mkdirSync(path.dirname(databasePath), { recursive: true, mode: 0o700 })
  }
  const db = new DatabaseSync(databasePath)
  if (databasePath !== ':memory:') fs.chmodSync(databasePath, 0o600)
  db.exec('PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;')
  db.exec(schemaSql)
  return db
}

export function closeDatabase(db) {
  db.close()
}
