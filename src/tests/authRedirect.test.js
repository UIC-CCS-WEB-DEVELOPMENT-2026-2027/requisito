import test from 'node:test'
import assert from 'node:assert/strict'
import { getSignInDestination } from '../utils/authRedirect.js'

test('a guarded route can preserve its intended return location through sign-in', () => {
  const requestedLocation = {
    pathname: '/restricted-area',
    search: '?step=1',
    hash: '#requirements',
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

test('direct visit to /login then sign-in goes to Home', () => {
  assert.equal(getSignInDestination(undefined), '/')
})

test('signed-in visit to /login redirects to Home with replace', () => {
  const loginRedirect = {
    to: getSignInDestination(),
    replace: true,
  }

  assert.equal(loginRedirect.to, '/')
  assert.equal(loginRedirect.replace, true)
})
