import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { randomBytes } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { hashPassword, validatePassword, verifyPassword } from './auth/passwords.js'
import { createSession, findSession, hashToken, readSessionToken } from './auth/sessions.js'
import { loadConfig } from './config.js'
import { isAllowedSourceUrl } from './config/sourceAllowlist.js'
import { appendAudit } from './db/audit.js'
import { closeDatabase, openDatabase } from './db/openDatabase.js'
import { decideVerificationRequest, editRecord, recordVerificationRequest } from './db/records.js'

const root = fileURLToPath(new URL('../', import.meta.url))

function temporaryDatabase(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'requisito-admin-test-'))
  const db = openDatabase(path.join(directory, 'test.sqlite'))
  t.after(() => {
    closeDatabase(db)
    fs.rmSync(directory, { recursive: true, force: true })
  })
  return db
}

function fixtureRecord(db, { verification = 'unverified', population2020 = null } = {}) {
  db.prepare(`
    INSERT INTO records (type, id, data, verification, last_verified, updated_at)
    VALUES ('barangay', 'fixture-record', ?, ?, ?, ?)
  `).run(JSON.stringify({
    slug: 'fixture-record',
    title: 'Temporary test fixture',
    description: 'Test-only record, not civic data.',
    adminDistrict: 'Test-only',
    legislativeDistrict: 'Test-only',
    population2020,
    sourceUrl: '',
  }), verification, verification === 'verified' ? '2025-01-01' : null, new Date().toISOString())
}

test('configuration rejects missing, placeholder, and malformed values', () => {
  assert.throws(() => loadConfig({ SESSION_SECRET: '' }), /SESSION_SECRET/)
  assert.throws(() => loadConfig({ SESSION_SECRET: 'replace-with-at-least-32-random-characters' }), /SESSION_SECRET/)
  assert.throws(() => loadConfig({ PORT: '70000', SESSION_SECRET: randomBytes(32).toString('hex') }), /PORT/)
  assert.throws(() => loadConfig({ APP_ORIGIN: 'http://localhost:5173/path', SESSION_SECRET: randomBytes(32).toString('hex') }), /APP_ORIGIN/)
  const config = loadConfig({ SESSION_SECRET: randomBytes(32).toString('hex') })
  assert.equal(config.port, 8787)
  assert.equal(config.secureCookies, false)
})

test('passwords use salted scrypt hashes and verify without storing the submitted value', async () => {
  const password = randomBytes(32).toString('base64url')
  const hash = await hashPassword(password)
  assert.match(hash, /^scrypt\$16384\$8\$1\$/)
  assert.equal(hash.includes(password), false)
  assert.equal(await verifyPassword(password, hash), true)
  assert.equal(await verifyPassword(randomBytes(32).toString('base64url'), hash), false)
  assert.equal(await verifyPassword(password, undefined), false)
  assert.throws(() => validatePassword('short'), /12 characters/)
})

test('session tokens are stored only as keyed hashes and expire after eight hours', (t) => {
  const db = temporaryDatabase(t)
  const username = `user-${randomBytes(6).toString('hex')}`
  const userId = Number(db.prepare(`
    INSERT INTO users (username, password_hash, role, created_at)
    VALUES (?, ?, 'viewer', ?)
  `).run(username, 'test-only-hash', new Date().toISOString()).lastInsertRowid)
  const secret = randomBytes(32).toString('hex')
  const now = new Date('2026-10-23T08:00:00.000Z')
  const session = createSession(db, userId, secret, now)
  const stored = db.prepare('SELECT id, expires_at FROM sessions WHERE user_id = ?').get(userId)
  assert.equal(stored.id, hashToken(session.token, secret))
  assert.notEqual(stored.id, session.token)
  assert.equal(stored.expires_at, '2026-10-23T16:00:00.000Z')
  assert.equal(findSession(db, session.token, secret, now).username, username)
  assert.equal(findSession(db, session.token, secret, new Date('2026-10-23T16:00:00.000Z')), null)
  assert.equal(readSessionToken(`other=x; requisito_admin=${encodeURIComponent(session.token)}`), session.token)
})

test('official-source allowlist requires HTTPS and exact host matches', () => {
  assert.equal(isAllowedSourceUrl('https://psa.gov.ph/system/files/example.xlsx'), true)
  assert.equal(isAllowedSourceUrl('https://psa.gov.ph.evil.example/path'), false)
  assert.equal(isAllowedSourceUrl('http://psa.gov.ph/path'), false)
  assert.equal(isAllowedSourceUrl('https://user@psa.gov.ph/path'), false)
})

test('editing a verified record resets verification and appends a complete audit entry', (t) => {
  const db = temporaryDatabase(t)
  fixtureRecord(db, { verification: 'verified' })
  const updated = editRecord(db, {
    type: 'barangay',
    id: 'fixture-record',
    data: { title: 'Updated fixture title' },
    actor: 'reviewer-test',
    note: 'Corrected a test-only label.',
    now: '2026-10-23T08:00:00.000Z',
  })
  assert.equal(updated.verification, 'unverified')
  assert.equal(updated.lastVerified, null)
  const entry = db.prepare('SELECT * FROM audit_log ORDER BY id DESC LIMIT 1').get()
  assert.equal(entry.action, 'record.edited.reset-verification')
  assert.equal(JSON.parse(entry.previous).verification, 'verified')
  assert.equal(JSON.parse(entry.next).verification, 'unverified')
})

test('population changes require a valid official source and an explanatory note', (t) => {
  const db = temporaryDatabase(t)
  fixtureRecord(db)
  const values = {
    type: 'barangay',
    id: 'fixture-record',
    data: { population2020: 0 },
    actor: 'reviewer-test',
    now: '2026-10-23T08:00:00.000Z',
  }
  assert.throws(() => editRecord(db, { ...values, note: '' }), /source URL and note/)
  assert.throws(() => editRecord(db, {
    ...values,
    sourceUrl: 'https://psa.gov.ph.evil.example/file',
    note: 'Test source.',
  }), /configured official source/)
  const updated = editRecord(db, {
    ...values,
    sourceUrl: 'https://psa.gov.ph/system/files/Region%20XI.xlsx',
    note: 'Compared the temporary value with the PSA table.',
  })
  assert.equal(updated.population2020, 0)
  assert.equal(updated.sourceUrl, 'https://psa.gov.ph/system/files/Region%20XI.xlsx')
})

test('two-person approval refuses self-approval and only approval verifies', (t) => {
  const db = temporaryDatabase(t)
  fixtureRecord(db)
  const submitterId = Number(db.prepare(`
    INSERT INTO users (username, password_hash, role, created_at)
    VALUES (?, ?, 'reviewer', ?)
  `).run(`submitter-${randomBytes(5).toString('hex')}`, 'test-only-hash', new Date().toISOString()).lastInsertRowid)
  const reviewerId = Number(db.prepare(`
    INSERT INTO users (username, password_hash, role, created_at)
    VALUES (?, ?, 'reviewer', ?)
  `).run(`reviewer-${randomBytes(5).toString('hex')}`, 'test-only-hash', new Date().toISOString()).lastInsertRowid)
  const now = '2026-10-23T08:00:00.000Z'
  const requestId = recordVerificationRequest(db, {
    type: 'barangay',
    id: 'fixture-record',
    userId: submitterId,
    actor: 'submitter',
    sourceUrl: 'https://psa.gov.ph/Region%20XI.xlsx',
    sourceAccessedOn: '2026-10-23',
    note: 'Compared the test-only name and population fields.',
    now,
  })
  assert.deepEqual(decideVerificationRequest(db, {
    requestId,
    reviewer: { id: submitterId, username: 'submitter' },
    decision: 'approved',
    now,
  }), { error: 'self_approval' })
  assert.equal(decideVerificationRequest(db, {
    requestId,
    reviewer: { id: reviewerId, username: 'reviewer' },
    decision: 'rejected',
    now,
  }).request.status, 'rejected')
  assert.equal(db.prepare("SELECT verification FROM records WHERE id = 'fixture-record'").get().verification, 'unverified')
  const supersededId = recordVerificationRequest(db, {
    type: 'barangay',
    id: 'fixture-record',
    userId: submitterId,
    actor: 'submitter',
    sourceUrl: 'https://psa.gov.ph/older-source.xlsx',
    sourceAccessedOn: '2026-10-23',
    note: 'A second pending source review for the test record.',
    now,
  })
  const approvalId = recordVerificationRequest(db, {
    type: 'barangay',
    id: 'fixture-record',
    userId: submitterId,
    actor: 'submitter',
    sourceUrl: 'https://psa.gov.ph/Region%20XI.xlsx',
    sourceAccessedOn: '2026-10-23',
    note: 'Compared the test-only name and population fields.',
    now,
  })
  const approval = decideVerificationRequest(db, {
    requestId: approvalId,
    reviewer: { id: reviewerId, username: 'reviewer' },
    decision: 'approved',
    now,
  })
  assert.equal(approval.record.verification, 'verified')
  assert.equal(approval.record.lastVerified, '2026-10-23')
  assert.equal(approval.record.sourceUrl, 'https://psa.gov.ph/Region%20XI.xlsx')
  assert.equal(db.prepare('SELECT status FROM verification_requests WHERE id = ?').get(supersededId).status, 'cancelled')
  assert.equal(db.prepare("SELECT COUNT(*) AS count FROM audit_log WHERE action = 'verification.cancelled-after-approval'").get().count, 1)
  assert.deepEqual(recordVerificationRequest(db, {
    type: 'barangay',
    id: 'fixture-record',
    userId: submitterId,
    actor: 'submitter',
    sourceUrl: 'https://psa.gov.ph/Region%20XI.xlsx',
    sourceAccessedOn: '2026-10-23',
    note: 'Cannot create another review for a verified record.',
    now,
  }), { error: 'already_verified' })
  const audit = db.prepare('SELECT next FROM audit_log WHERE action = ?').get('verification.approved')
  assert.equal(JSON.parse(audit.next).request.sourceUrl, 'https://psa.gov.ph/Region%20XI.xlsx')
})

test('editing a record cancels pending verification requests and records the cancellation', (t) => {
  const db = temporaryDatabase(t)
  fixtureRecord(db)
  const submitterId = Number(db.prepare(`
    INSERT INTO users (username, password_hash, role, created_at)
    VALUES (?, ?, 'reviewer', ?)
  `).run(`submitter-${randomBytes(5).toString('hex')}`, 'test-only-hash', new Date().toISOString()).lastInsertRowid)
  const reviewerId = Number(db.prepare(`
    INSERT INTO users (username, password_hash, role, created_at)
    VALUES (?, ?, 'reviewer', ?)
  `).run(`reviewer-${randomBytes(5).toString('hex')}`, 'test-only-hash', new Date().toISOString()).lastInsertRowid)
  const now = '2026-10-23T08:00:00.000Z'
  const requestId = recordVerificationRequest(db, {
    type: 'barangay',
    id: 'fixture-record',
    userId: submitterId,
    actor: 'submitter',
    sourceUrl: 'https://psa.gov.ph/Region%20XI.xlsx',
    sourceAccessedOn: '2026-10-23',
    note: 'Compared the test-only name and population fields.',
    now,
  })
  editRecord(db, {
    type: 'barangay',
    id: 'fixture-record',
    data: { title: 'Changed after review request' },
    actor: 'editor',
    note: 'Updated the test-only title.',
    now,
  })
  assert.equal(db.prepare('SELECT status FROM verification_requests WHERE id = ?').get(requestId).status, 'cancelled')
  assert.equal(decideVerificationRequest(db, {
    requestId,
    reviewer: { id: reviewerId, username: 'reviewer' },
    decision: 'approved',
    now,
  }).error, 'not_found')
  assert.equal(db.prepare("SELECT verification FROM records WHERE id = 'fixture-record'").get().verification, 'unverified')
  assert.equal(db.prepare("SELECT COUNT(*) AS count FROM audit_log WHERE action = 'verification.cancelled-by-edit'").get().count, 1)
})

test('audit log cannot be updated or deleted and server code has no such mutation query', (t) => {
  const db = temporaryDatabase(t)
  appendAudit(db, { at: new Date().toISOString(), actor: 'test', action: 'test.appended' })
  assert.throws(() => db.prepare('UPDATE audit_log SET note = ? WHERE id = ?').run('changed', 1), /append-only/)
  assert.throws(() => db.prepare('DELETE FROM audit_log WHERE id = ?').run(1), /append-only/)
  const serverDir = fileURLToPath(new URL('./', import.meta.url))
  const sourceFiles = []
  function walk(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name)
      if (entry.isDirectory()) walk(file)
      else if (file.endsWith('.js')) sourceFiles.push(file)
    }
  }
  walk(serverDir)
  for (const file of sourceFiles) {
    const source = fs.readFileSync(file, 'utf8')
    assert.doesNotMatch(source, /\b(?:UPDATE|DELETE)\s+(?:FROM\s+)?audit_log\b/i, `${path.relative(root, file)} mutates audit_log`)
  }
})
