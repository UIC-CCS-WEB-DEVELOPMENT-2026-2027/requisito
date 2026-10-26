import test from 'node:test'
import assert from 'node:assert/strict'
import { requireCsrf, requireEditor, requireRole, requireSession } from './middleware.js'

function invoke(middleware, { user = null, headers = {} } = {}) {
  const result = { status: 200, body: null, nextCalled: false }
  const req = {
    adminUser: user,
    get(name) {
      return headers[name.toLowerCase()] ?? undefined
    },
  }
  const res = {
    status(status) {
      result.status = status
      return this
    },
    json(body) {
      result.body = body
      return this
    },
  }
  middleware(req, res, () => { result.nextCalled = true })
  return result
}

test('administrative operations reject anonymous requests and allow authenticated sessions', () => {
  assert.deepEqual(invoke(requireSession), {
    status: 401,
    body: { error: 'Sign in is required.' },
    nextCalled: false,
  })
  assert.equal(invoke(requireSession, {
    user: { id: 1, role: 'viewer' },
  }).nextCalled, true)
  assert.equal(invoke(requireEditor).status, 401)
  assert.equal(invoke(requireRole('admin')).status, 401)
})

test('server roles independently restrict reviewer and admin operations', () => {
  assert.equal(invoke(requireEditor, {
    user: { id: 1, role: 'viewer' },
  }).status, 403)
  assert.equal(invoke(requireEditor, {
    user: { id: 2, role: 'reviewer' },
  }).nextCalled, true)
  assert.equal(invoke(requireRole('admin'), {
    user: { id: 2, role: 'reviewer' },
  }).status, 403)
  assert.equal(invoke(requireRole('admin'), {
    user: { id: 3, role: 'admin' },
  }).nextCalled, true)
})

test('state-changing administrative requests require the configured origin and portal header', () => {
  const csrf = requireCsrf({ allowedOrigin: 'http://localhost:5173' })
  assert.equal(invoke(csrf).status, 403)
  assert.equal(invoke(csrf, {
    headers: {
      'x-requested-with': 'portal-admin',
      origin: 'https://untrusted.example',
    },
  }).status, 403)
  assert.equal(invoke(csrf, {
    headers: {
      'x-requested-with': 'portal-admin',
      origin: 'http://localhost:5173',
    },
  }).nextCalled, true)
})
