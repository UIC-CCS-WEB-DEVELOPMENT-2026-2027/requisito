import test from 'node:test'
import assert from 'node:assert/strict'
import { getAdminSignInDestination } from '../admin/adminRedirect.js'

test('admin login returns to the requested admin route and preserves query and hash', () => {
  assert.equal(getAdminSignInDestination({
    from: { pathname: '/admin/records/requirements/5', search: '?tab=history', hash: '#evidence' },
  }), '/admin/records/requirements/5?tab=history#evidence')
})

test('admin login falls back to the dashboard for non-admin and malformed destinations', () => {
  assert.equal(getAdminSignInDestination({ from: { pathname: '/goals/first-job' } }), '/admin')
  assert.equal(getAdminSignInDestination({ from: { pathname: '/administrator' } }), '/admin')
  assert.equal(getAdminSignInDestination(undefined), '/admin')
})
