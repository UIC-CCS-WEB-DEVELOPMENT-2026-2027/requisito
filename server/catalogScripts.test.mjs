import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { catalogNames, recordTypes } from './db/catalogs.js'
import { openDatabase } from './db/openDatabase.js'
import {
  decideVerificationRequest,
  editRecord,
  recordVerificationRequest,
} from './db/records.js'

const root = fileURLToPath(new URL('../', import.meta.url))

function runScript(script, directory) {
  return spawnSync(process.execPath, [path.join(root, 'scripts', script)], {
    cwd: root,
    env: {
      ...process.env,
      ADMIN_DATA_DIR: path.join(directory, 'data'),
      DATABASE_PATH: path.join(directory, 'admin.sqlite'),
    },
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
  })
}

function makeFixture(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'requisito-catalog-test-'))
  const dataDirectory = path.join(directory, 'data')
  fs.cpSync(path.join(root, 'src/data'), dataDirectory, { recursive: true })
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }))
  return { directory, dataDirectory, databasePath: path.join(directory, 'admin.sqlite') }
}

test('catalog import is idempotent and does not overwrite existing database records', (t) => {
  const fixture = makeFixture(t)
  const first = runScript('db-import.mjs', fixture.directory)
  assert.equal(first.status, 0, first.stderr)
  assert.match(first.stdout, /Database import complete:/)

  const db = openDatabase(fixture.databasePath)
  const initialCount = db.prepare('SELECT COUNT(*) AS count FROM records').get().count
  const source = db.prepare("SELECT id, data FROM records WHERE type = 'requirementSource' LIMIT 1").get()
  assert.ok(source)
  assert.equal(JSON.parse(source.data).url.startsWith('https://'), true)
  const record = db.prepare("SELECT id, data FROM records WHERE type = 'service' ORDER BY id LIMIT 1").get()
  assert.ok(record)
  const original = JSON.parse(record.data)
  db.prepare("UPDATE records SET data = ? WHERE type = 'service' AND id = ?")
    .run(JSON.stringify({ ...original, title: 'Existing database edit' }), record.id)
  db.close()

  const second = runScript('db-import.mjs', fixture.directory)
  assert.equal(second.status, 0, second.stderr)
  assert.match(second.stdout, new RegExp(`0 added, ${initialCount} already present`))
  const reloaded = openDatabase(fixture.databasePath)
  const persisted = reloaded.prepare("SELECT data FROM records WHERE type = 'service' AND id = ?").get(record.id)
  assert.equal(JSON.parse(persisted.data).title, 'Existing database edit')
  assert.equal(reloaded.prepare('SELECT COUNT(*) AS count FROM records').get().count, initialCount)
  reloaded.close()
})

test('requirement source records import and export through the reviewable catalog', (t) => {
  const fixture = makeFixture(t)
  const imported = runScript('db-import.mjs', fixture.directory)
  assert.equal(imported.status, 0, imported.stderr)
  const db = openDatabase(fixture.databasePath)
  const row = db.prepare(
    "SELECT id, data FROM records WHERE type = 'requirementSource' AND id = ?",
  ).get('sss-become-member-faq')
  assert.ok(row)
  const current = JSON.parse(row.data)
  const updated = editRecord(db, {
    type: 'requirementSource',
    id: row.id,
    data: { limitations: `${current.limitations} Test-only edit.` },
    actor: 'test-editor',
    note: 'Document a test-only source limitation.',
    now: '2026-10-26T08:00:00.000Z',
  })
  assert.equal(updated.verification, 'unverified')
  db.close()

  const exported = runScript('db-export.mjs', fixture.directory)
  assert.equal(exported.status, 0, `${exported.stdout}\n${exported.stderr}`)
  const output = JSON.parse(fs.readFileSync(
    path.join(fixture.dataDirectory, 'requirementSources.json'),
    'utf8',
  ))
  const exportedSource = output.find((source) => source.id === 'sss-become-member-faq')
  assert.match(exportedSource.limitations, /Test-only edit\.$/)
  assert.equal(exportedSource.url, 'https://www.sss.gov.ph/become-an-sss-member/')
  assert.equal(Object.hasOwn(exportedSource, 'type'), false)
  assert.equal(Object.hasOwn(exportedSource, 'lastVerified'), false)
})

test('independent source review exports its reviewer evidence without changing source identity', (t) => {
  const fixture = makeFixture(t)
  const imported = runScript('db-import.mjs', fixture.directory)
  assert.equal(imported.status, 0, imported.stderr)
  const db = openDatabase(fixture.databasePath)
  db.prepare(`
    INSERT INTO users (username, password_hash, role, created_at)
    VALUES (?, ?, ?, ?)
  `).run('source-submitter', 'test-hash', 'reviewer', '2026-10-26T08:00:00.000Z')
  db.prepare(`
    INSERT INTO users (username, password_hash, role, created_at)
    VALUES (?, ?, ?, ?)
  `).run('source-reviewer', 'test-hash', 'reviewer', '2026-10-26T08:00:00.000Z')
  const submitterId = db.prepare(
    'SELECT id FROM users WHERE username = ?',
  ).get('source-submitter').id
  const reviewerId = db.prepare(
    'SELECT id FROM users WHERE username = ?',
  ).get('source-reviewer').id
  const requestId = recordVerificationRequest(db, {
    type: 'requirementSource',
    id: 'sss-become-member-faq',
    userId: submitterId,
    actor: 'source-submitter',
    sourceUrl: 'https://www.sss.gov.ph/become-an-sss-member/',
    sourceAccessedOn: '2026-10-26',
    note: 'Compared the SSS application and employer-reporting claims with the cited page.',
    now: '2026-10-26T08:00:00.000Z',
  })
  const result = decideVerificationRequest(db, {
    requestId,
    reviewer: { id: reviewerId, username: 'source-reviewer' },
    decision: 'approved',
    decisionNote: 'Confirmed the listed claims against the official SSS page.',
    now: '2026-10-26T08:01:00.000Z',
  })
  assert.equal(result.record.verification, 'verified')
  assert.equal(result.record.url, 'https://www.sss.gov.ph/become-an-sss-member/')
  assert.equal(result.record.lastChecked, '2026-10-26')
  assert.equal(result.record.verificationReview.reviewedById, reviewerId)
  db.close()

  const exported = runScript('db-export.mjs', fixture.directory)
  assert.equal(exported.status, 0, `${exported.stdout}\n${exported.stderr}`)
  const output = JSON.parse(fs.readFileSync(
    path.join(fixture.dataDirectory, 'requirementSources.json'),
    'utf8',
  ))
  const approvedSource = output.find((source) => source.id === 'sss-become-member-faq')
  assert.equal(approvedSource.verification, 'verified')
  assert.equal(approvedSource.verificationReview.reviewedById, reviewerId)
  assert.equal(approvedSource.verificationReview.independent, true)
})

test('catalog export validates in isolation, retains edited records, and writes trailing newlines', (t) => {
  const fixture = makeFixture(t)
  const imported = runScript('db-import.mjs', fixture.directory)
  assert.equal(imported.status, 0, imported.stderr)
  const db = openDatabase(fixture.databasePath)
  const row = db.prepare("SELECT id, data FROM records WHERE type = 'service' ORDER BY id LIMIT 1").get()
  const current = JSON.parse(row.data)
  const updatedTitle = `${current.title} (reviewed test fixture)`
  const updated = editRecord(db, {
    type: 'service',
    id: row.id,
    data: { title: updatedTitle },
    actor: 'test-reviewer',
    note: 'A valid test-only catalog change.',
    now: '2026-10-23T08:00:00.000Z',
  })
  assert.equal(updated.title, updatedTitle)
  db.close()

  const exported = runScript('db-export.mjs', fixture.directory)
  assert.equal(exported.status, 0, `${exported.stdout}\n${exported.stderr}`)
  for (const name of catalogNames) {
    const text = fs.readFileSync(path.join(fixture.dataDirectory, `${name}.json`), 'utf8')
    assert.equal(text.endsWith('\n'), true, `${name}.json has a trailing newline`)
    assert.doesNotThrow(() => JSON.parse(text), `${name}.json is valid JSON`)
  }
  const output = JSON.parse(fs.readFileSync(path.join(fixture.dataDirectory, 'services.json'), 'utf8'))
  assert.equal(output.find((item) => String(item.id) === String(row.id)).title, updatedTitle)
})

test('invalid export is refused without changing any catalog file', (t) => {
  const fixture = makeFixture(t)
  const imported = runScript('db-import.mjs', fixture.directory)
  assert.equal(imported.status, 0, imported.stderr)
  const db = openDatabase(fixture.databasePath)
  const type = recordTypes.services
  const row = db.prepare('SELECT id FROM records WHERE type = ? ORDER BY id LIMIT 1').get(type)
  db.prepare("UPDATE records SET verification = 'verified', last_verified = NULL WHERE type = ? AND id = ?")
    .run(type, row.id)
  db.close()
  const originals = new Map(catalogNames.map((name) => [
    name,
    fs.readFileSync(path.join(fixture.dataDirectory, `${name}.json`)),
  ]))

  const exported = runScript('db-export.mjs', fixture.directory)
  assert.notEqual(exported.status, 0)
  for (const name of catalogNames) {
    assert.deepEqual(
      fs.readFileSync(path.join(fixture.dataDirectory, `${name}.json`)),
      originals.get(name),
      `${name}.json remains untouched after refused export`,
    )
    assert.equal(fs.readdirSync(fixture.dataDirectory).some((file) => file.endsWith('.tmp')), false)
  }
})

test('export refuses a valid but unaudited database edit', (t) => {
  const fixture = makeFixture(t)
  const imported = runScript('db-import.mjs', fixture.directory)
  assert.equal(imported.status, 0, imported.stderr)
  const db = openDatabase(fixture.databasePath)
  const row = db.prepare("SELECT id, data FROM records WHERE type = 'service' ORDER BY id LIMIT 1").get()
  const data = JSON.parse(row.data)
  db.prepare('UPDATE records SET data = ? WHERE type = ? AND id = ?')
    .run(JSON.stringify({ ...data, title: 'Valid but unaudited edit' }), 'service', row.id)
  db.close()
  const original = fs.readFileSync(path.join(fixture.dataDirectory, 'services.json'))

  const exported = runScript('db-export.mjs', fixture.directory)
  assert.notEqual(exported.status, 0)
  assert.match(`${exported.stdout}\n${exported.stderr}`, /no matching state-change audit entry/)
  assert.deepEqual(fs.readFileSync(path.join(fixture.dataDirectory, 'services.json')), original)
})
