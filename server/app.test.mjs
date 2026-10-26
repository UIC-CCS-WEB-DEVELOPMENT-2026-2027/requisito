import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { randomBytes } from 'node:crypto'
import { hashPassword } from './auth/passwords.js'
import { createSession } from './auth/sessions.js'
import { openDatabase } from './db/openDatabase.js'
import { recordVerificationRequest } from './db/records.js'

let createApp
let importFailure
try {
  ({ createApp } = await import('./app.js'))
} catch (error) {
  if (error.code === 'ERR_MODULE_NOT_FOUND' && /express|helmet/.test(error.message)) {
    importFailure = 'Install the declared API dependencies with npm install to run HTTP integration tests.'
  } else {
    throw error
  }
}

const integrationSkip = importFailure || false
const allowedOrigin = 'http://localhost:5173'
const verificationDate = '2026-10-23'

function randomPassword() {
  return randomBytes(32).toString('base64url')
}

async function createUser(db, role, username = `test-${randomBytes(6).toString('hex')}`) {
  const password = randomPassword()
  const passwordHash = await hashPassword(password)
  const result = db.prepare(`
    INSERT INTO users (username, password_hash, role, disabled, created_at)
    VALUES (?, ?, ?, 0, ?)
  `).run(username, passwordHash, role, new Date().toISOString())
  return { id: Number(result.lastInsertRowid), username, role, password }
}

function createFixture(db, id) {
  db.prepare(`
    INSERT INTO records (type, id, data, verification, last_verified, updated_at)
    VALUES ('barangay', ?, ?, 'unverified', NULL, ?)
  `).run(id, JSON.stringify({
    slug: id,
    title: 'Temporary integration fixture',
    description: 'Test-only record; not a civic claim.',
    category: 'test',
    sourceUrl: 'https://psa.gov.ph/Region%20XI.xlsx',
    notes: '',
    adminDistrict: 'Test-only',
    legislativeDistrict: 'Test-only',
    population2020: null,
    isSample: false,
  }), new Date().toISOString())
}

async function startHarness(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'requisito-api-test-'))
  let db
  let server
  t.after(async () => {
    try {
      if (server?.listening) {
        await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
      }
    } finally {
      try {
        db?.close()
      } finally {
        fs.rmSync(directory, { recursive: true, force: true })
      }
    }
  })
  db = openDatabase(path.join(directory, 'test.sqlite'))
  const config = {
    port: 0,
    databasePath: path.join(directory, 'test.sqlite'),
    sessionSecret: randomBytes(32).toString('hex'),
    nodeEnv: 'test',
    secureCookies: false,
    allowedOrigin,
    now: () => new Date(`${verificationDate}T08:00:00.000Z`),
  }
  const app = createApp({ db, config })
  server = app.listen(0, '127.0.0.1')
  await new Promise((resolve, reject) => {
    const onListening = () => {
      server.off('error', onError)
      resolve()
    }
    const onError = (error) => {
      server.off('listening', onListening)
      reject(error)
    }
    server.once('listening', onListening)
    server.once('error', onError)
  })
  const address = server.address()
  const baseUrl = `http://127.0.0.1:${address.port}`
  return { db, config, baseUrl }
}

async function request(harness, route, {
  method = 'GET',
  body,
  token,
  csrf = true,
  origin = allowedOrigin,
} = {}) {
  const headers = {}
  if (origin) headers.Origin = origin
  if (csrf && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    headers['X-Requested-With'] = 'portal-admin'
  }
  if (token) headers.Cookie = `requisito_admin=${encodeURIComponent(token)}`
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }
  return fetch(`${harness.baseUrl}${route}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}

async function login(harness, user) {
  const response = await request(harness, '/api/login', {
    method: 'POST',
    body: { username: user.username, password: user.password },
  })
  const cookie = response.headers.get('set-cookie')?.split(';', 1)[0] ?? ''
  return { response, token: decodeURIComponent(cookie.split('=').slice(1).join('=')) }
}

function issueSession(harness, user) {
  return createSession(harness.db, user.id, harness.config.sessionSecret, harness.config.now()).token
}

test('HTTP login succeeds, failures are generic, and responses never expose passwords', { skip: integrationSkip }, async (t) => {
  const harness = await startHarness(t)
  const user = await createUser(harness.db, 'reviewer')
  const wrongPassword = randomPassword()
  const wrong = await request(harness, '/api/login', { method: 'POST', body: { username: user.username, password: wrongPassword } })
  const wrongBody = await wrong.json()
  const missing = await request(harness, '/api/login', { method: 'POST', body: { username: `missing-${randomBytes(6).toString('hex')}`, password: wrongPassword } })
  const missingBody = await missing.json()
  assert.equal(wrong.status, 401)
  assert.equal(missing.status, 401)
  assert.equal(wrongBody.error, 'Username or password is incorrect.')
  assert.equal(missingBody.error, wrongBody.error)

  const success = await login(harness, user)
  const body = await success.response.json()
  assert.equal(success.response.status, 200)
  assert.equal(body.user.role, 'reviewer')
  assert.equal(JSON.stringify(body).includes(user.password), false)
  assert.ok(success.token)
  assert.notEqual(harness.db.prepare('SELECT id FROM sessions WHERE user_id = ?').get(user.id).id, success.token)
  assert.equal(success.response.headers.get('set-cookie').includes('HttpOnly'), true)
  assert.equal(success.response.headers.get('set-cookie').includes('SameSite=Lax'), true)
})

test('login attempts lock out after five failures for the same IP and username', { skip: integrationSkip }, async (t) => {
  const harness = await startHarness(t)
  const username = `missing-${randomBytes(6).toString('hex')}`
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const response = await request(harness, '/api/login', {
      method: 'POST',
      body: { username, password: randomPassword() },
    })
    assert.equal(response.status, 401)
  }
  const locked = await request(harness, '/api/login', {
    method: 'POST',
    body: { username, password: randomPassword() },
  })
  assert.equal(locked.status, 429)
})

test('logout invalidates sessions and expired sessions are rejected', { skip: integrationSkip }, async (t) => {
  const harness = await startHarness(t)
  const user = await createUser(harness.db, 'viewer')
  const authenticated = await login(harness, user)
  assert.equal((await request(harness, '/api/me', { token: authenticated.token })).status, 200)
  assert.equal((await request(harness, '/api/logout', { method: 'POST', token: authenticated.token })).status, 204)
  assert.equal((await request(harness, '/api/me', { token: authenticated.token })).status, 401)

  const expired = issueSession(harness, user)
  harness.db.prepare('UPDATE sessions SET expires_at = ? WHERE user_id = ?')
    .run('2026-10-23T07:59:59.000Z', user.id)
  assert.equal((await request(harness, '/api/me', { token: expired })).status, 401)
})

test('every role is checked against read, edit, verify, review, and admin-only routes', { skip: integrationSkip }, async (t) => {
  const harness = await startHarness(t)
  const users = {
    viewer: await createUser(harness.db, 'viewer'),
    reviewer: await createUser(harness.db, 'reviewer'),
    admin: await createUser(harness.db, 'admin'),
    requester: await createUser(harness.db, 'reviewer'),
  }
  for (const role of ['viewer', 'reviewer', 'admin']) createFixture(harness.db, `fixture-${role}`)
  const tokens = Object.fromEntries(Object.entries(users).map(([key, user]) => [key, issueSession(harness, user)]))

  for (const role of ['viewer', 'reviewer', 'admin']) {
    const token = tokens[role]
    const id = `fixture-${role}`
    for (const route of [
      '/api/me',
      '/api/admin/summary',
      '/api/admin/population-summary',
      '/api/records?type=barangay',
      `/api/records/barangay/${id}`,
      `/api/records/barangay/${id}/verification`,
      '/api/review',
    ]) {
      assert.equal((await request(harness, route, { token })).status, 200, `${role} GET ${route}`)
    }

    const patch = await request(harness, `/api/records/barangay/${id}`, {
      method: 'PATCH', token, body: { data: { title: `Updated ${role} test fixture` }, note: 'Test-only edit.' },
    })
    assert.equal(patch.status, role === 'viewer' ? 403 : 200, `${role} PATCH record`)

    const verifyRequest = await request(harness, `/api/records/barangay/${id}/verification`, {
      method: 'POST',
      token,
      body: {
        source_url: 'https://psa.gov.ph/system/files/Region%20XI.xlsx',
        source_accessed_on: verificationDate,
        note: 'Compared the test-only fields against a temporary fixture.',
      },
    })
    assert.equal(verifyRequest.status, role === 'viewer' ? 403 : 201, `${role} POST verification request`)

    const decisionRequestId = recordVerificationRequest(harness.db, {
      type: 'barangay',
      id,
      userId: users.requester.id,
      actor: users.requester.username,
      sourceUrl: 'https://psa.gov.ph/system/files/Region%20XI.xlsx',
      sourceAccessedOn: verificationDate,
      note: 'Test-only verification request for role matrix.',
      now: harness.config.now().toISOString(),
    })
    const decision = await request(harness, `/api/review/${decisionRequestId}/decision`, {
      method: 'POST', token, body: { decision: 'rejected', note: 'Rejected after checking the source evidence.' },
    })
    assert.equal(decision.status, role === 'viewer' ? 403 : 200, `${role} POST verification decision`)

    assert.equal((await request(harness, '/api/admin/users?limit=10', { token })).status, role === 'admin' ? 200 : 403, `${role} GET users`)
    assert.equal((await request(harness, '/api/admin/audit?limit=10', { token })).status, role === 'admin' ? 200 : 403, `${role} GET audit`)

    const password = randomPassword()
    const createUserResponse = await request(harness, '/api/admin/users', {
      method: 'POST', token, body: { username: `created-${randomBytes(5).toString('hex')}`, password, role: 'viewer' },
    })
    assert.equal(createUserResponse.status, role === 'admin' ? 201 : 403, `${role} POST users`)
    assert.equal((await createUserResponse.text()).includes(password), false)

    const targetId = users.requester.id
    const updateUserResponse = await request(harness, `/api/admin/users/${targetId}`, {
      method: 'PATCH', token, body: { role: 'viewer' },
    })
    assert.equal(updateUserResponse.status, role === 'admin' ? 200 : 403, `${role} PATCH users`)
  }
})

test('state-changing requests require the portal header and matching Origin', { skip: integrationSkip }, async (t) => {
  const harness = await startHarness(t)
  const missingHeader = await request(harness, '/api/login', {
    method: 'POST',
    body: { username: 'nobody', password: randomPassword() },
    csrf: false,
  })
  const wrongOrigin = await request(harness, '/api/login', {
    method: 'POST',
    body: { username: 'nobody', password: randomPassword() },
    origin: 'https://untrusted.example',
  })
  const missingOrigin = await request(harness, '/api/login', {
    method: 'POST',
    body: { username: 'nobody', password: randomPassword() },
    origin: '',
  })
  assert.equal(missingHeader.status, 403)
  assert.equal(wrongOrigin.status, 403)
  assert.equal(missingOrigin.status, 403)
})

test('verification decisions enforce independent reviewers through the API', { skip: integrationSkip }, async (t) => {
  const harness = await startHarness(t)
  const submitter = await createUser(harness.db, 'reviewer')
  const reviewer = await createUser(harness.db, 'reviewer')
  const viewer = await createUser(harness.db, 'viewer')
  createFixture(harness.db, 'verification-fixture')
  const submitterToken = issueSession(harness, submitter)
  const reviewerToken = issueSession(harness, reviewer)
  const viewerToken = issueSession(harness, viewer)
  const invalidSource = await request(harness, '/api/records/barangay/verification-fixture/verification', {
    method: 'POST',
    token: submitterToken,
    body: {
      source_url: 'https://psa.gov.ph.evil.example/path',
      source_accessed_on: verificationDate,
      note: 'Compared the test-only record fields.',
    },
  })
  assert.equal(invalidSource.status, 400)
  const created = await request(harness, '/api/records/barangay/verification-fixture/verification', {
    method: 'POST',
    token: submitterToken,
    body: {
      source_url: 'https://psa.gov.ph/system/files/Region%20XI.xlsx',
      source_accessed_on: verificationDate,
      note: 'Compared the test-only record fields against this source.',
    },
  })
  assert.equal(created.status, 201)
  const { requestId } = await created.json()
  const selfApproval = await request(harness, `/api/review/${requestId}/decision`, {
    method: 'POST',
    token: submitterToken,
    body: { decision: 'approved', reviewer_id: reviewer.id, note: 'Reviewed the source passage and claim.' },
  })
  assert.equal(selfApproval.status, 403)
  assert.deepEqual(await selfApproval.json(), { error: 'You cannot decide your own verification request.' })
  const selfRejection = await request(harness, `/api/review/${requestId}/decision`, {
    method: 'POST',
    token: submitterToken,
    body: { decision: 'rejected', user_id: reviewer.id, note: 'Reviewed the source passage and claim.' },
  })
  assert.equal(selfRejection.status, 403)
  assert.deepEqual(await selfRejection.json(), { error: 'You cannot decide your own verification request.' })
  const unauthenticated = await request(harness, `/api/review/${requestId}/decision`, {
    method: 'POST',
    body: { decision: 'approved' },
  })
  assert.equal(unauthenticated.status, 401)
  const unauthorized = await request(harness, `/api/review/${requestId}/decision`, {
    method: 'POST',
    token: viewerToken,
    body: { decision: 'approved' },
  })
  assert.equal(unauthorized.status, 403)
  const invalidDecision = await request(harness, `/api/review/${requestId}/decision`, {
    method: 'POST',
    token: reviewerToken,
    body: { decision: 'verified' },
  })
  assert.equal(invalidDecision.status, 400)
  const missingReviewNote = await request(harness, `/api/review/${requestId}/decision`, {
    method: 'POST',
    token: reviewerToken,
    body: { decision: 'approved', note: 'Too short' },
  })
  assert.equal(missingReviewNote.status, 400)
  const missingRequest = await request(harness, '/api/review/999999/decision', {
    method: 'POST',
    token: reviewerToken,
    body: { decision: 'rejected', note: 'Reviewed the available source evidence.' },
  })
  assert.equal(missingRequest.status, 404)
  const unchangedRequest = harness.db.prepare('SELECT status, decided_by FROM verification_requests WHERE id = ?').get(requestId)
  assert.equal(unchangedRequest.status, 'pending')
  assert.equal(unchangedRequest.decided_by, null)
  assert.equal(harness.db.prepare("SELECT verification FROM records WHERE id = 'verification-fixture'").get().verification, 'unverified')
  assert.equal(harness.db.prepare("SELECT COUNT(*) AS count FROM audit_log WHERE action IN ('verification.approved', 'verification.rejected')").get().count, 0)

  const approved = await request(harness, `/api/review/${requestId}/decision`, {
    method: 'POST',
    token: reviewerToken,
    body: { decision: 'approved', reviewer_id: submitter.id, note: 'Reviewed the available source evidence.' },
  })
  assert.equal(approved.status, 200)
  assert.equal((await approved.json()).record.verification, 'verified')
  const alreadyDecided = await request(harness, `/api/review/${requestId}/decision`, {
    method: 'POST',
    token: reviewerToken,
    body: { decision: 'rejected', note: 'Reviewed the available source evidence.' },
  })
  assert.equal(alreadyDecided.status, 404)
  assert.equal(harness.db.prepare('SELECT status FROM verification_requests WHERE id = ?').get(requestId).status, 'approved')
  assert.equal(
    harness.db.prepare('SELECT decision_note FROM verification_requests WHERE id = ?').get(requestId).decision_note,
    'Reviewed the available source evidence.',
  )
  assert.equal(harness.db.prepare("SELECT COUNT(*) AS count FROM audit_log WHERE action = 'verification.approved'").get().count, 1)
})

test('record edits reject non-HTTPS source URLs without changing stored data', { skip: integrationSkip }, async (t) => {
  const harness = await startHarness(t)
  const reviewer = await createUser(harness.db, 'reviewer')
  createFixture(harness.db, 'source-edit-fixture')
  const token = issueSession(harness, reviewer)
  const rejected = await request(harness, '/api/records/barangay/source-edit-fixture', {
    method: 'PATCH',
    token,
    body: { data: { sourceUrl: 'http://untrusted.example/source' }, note: 'Test invalid source URL.' },
  })
  assert.equal(rejected.status, 400)
  assert.equal(
    JSON.parse(harness.db.prepare("SELECT data FROM records WHERE id = 'source-edit-fixture'").get().data).sourceUrl,
    'https://psa.gov.ph/Region%20XI.xlsx',
  )
})

test('the final active admin cannot be disabled or demoted', { skip: integrationSkip }, async (t) => {
  const harness = await startHarness(t)
  const first = await createUser(harness.db, 'admin')
  const second = await createUser(harness.db, 'admin')
  const firstToken = issueSession(harness, first)
  const secondToken = issueSession(harness, second)
  const disableFirst = await request(harness, `/api/admin/users/${first.id}`, {
    method: 'PATCH', token: firstToken, body: { disabled: true },
  })
  assert.equal(disableFirst.status, 200)

  const demoteLast = await request(harness, `/api/admin/users/${second.id}`, {
    method: 'PATCH', token: secondToken, body: { role: 'reviewer' },
  })
  assert.equal(demoteLast.status, 409)
  assert.equal(
    harness.db.prepare("SELECT COUNT(*) AS count FROM users WHERE role = 'admin' AND disabled = 0").get().count,
    1,
  )
})

test('no submitted password is returned or logged during login failures or user creation', { skip: integrationSkip }, async (t) => {
  const harness = await startHarness(t)
  const admin = await createUser(harness.db, 'admin')
  const password = randomPassword()
  const logged = []
  t.mock.method(console, 'error', (...args) => logged.push(args.join(' ')))
  const response = await request(harness, '/api/login', {
    method: 'POST',
    body: { username: 'unknown', password },
  })
  const responseText = await response.text()
  assert.equal(responseText.includes(password), false)
  const createdPassword = randomPassword()
  const createdUser = await request(harness, '/api/admin/users', {
    method: 'POST',
    token: issueSession(harness, admin),
    body: { username: `secret-test-${randomBytes(4).toString('hex')}`, password: createdPassword, role: 'viewer' },
  })
  assert.equal(createdUser.status, 201)
  assert.equal((await createdUser.text()).includes(createdPassword), false)
  assert.equal(logged.join('\n').includes(password), false)
  assert.equal(logged.join('\n').includes(createdPassword), false)
})
