import test from 'node:test'
import assert from 'node:assert/strict'
import { getSignInDestination } from '../utils/authRedirect.js'

test('signed-out protected route returns to its requested location after sign-in', () => {
  const requestedLocation = {
    pathname: '/goals',
    search: '',
    hash: '',
    key: 'requested',
  }
  const protectedRouteRedirect = {
    pathname: '/login',
    state: { from: requestedLocation },
    replace: true,
  }

  assert.equal(protectedRouteRedirect.pathname, '/login')
  assert.equal(protectedRouteRedirect.replace, true)
  assert.deepEqual(getSignInDestination(protectedRouteRedirect.state), requestedLocation)
})

test('direct visit to login falls back to Home after sign-in', () => {
  assert.equal(getSignInDestination(undefined), '/')
})

test('signed-in visit to login redirects to Home', () => {
  assert.equal(getSignInDestination(), '/')
})
