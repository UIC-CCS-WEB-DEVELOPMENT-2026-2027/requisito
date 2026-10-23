import { useCallback, useEffect, useMemo, useState } from 'react'
import { adminRequest } from './api.js'
import { AdminAuthContext } from './AdminAuthContext.js'

function applyAuthFailure(failure, setState) {
  if (failure.status === 401) {
    setState({ status: 'anonymous', user: null, error: '' })
  } else {
    setState({
      status: failure.status === 403 ? 'forbidden' : 'error',
      user: null,
      error: failure.message,
    })
  }
}

export default function AdminAuthProvider({ children }) {
  const [auth, setAuth] = useState({ status: 'loading', user: null, error: '' })

  useEffect(() => {
    const controller = new AbortController()
    adminRequest('/me', { signal: controller.signal })
      .then((response) => {
        if (!controller.signal.aborted) setAuth({ status: 'authenticated', user: response.user, error: '' })
      })
      .catch((failure) => {
        if (!controller.signal.aborted) applyAuthFailure(failure, setAuth)
      })
    return () => controller.abort()
  }, [])

  const login = useCallback(async (username, password) => {
    const response = await adminRequest('/login', { method: 'POST', body: { username, password } })
    setAuth({ status: 'authenticated', user: response.user, error: '' })
    return response.user
  }, [])

  const logout = useCallback(async () => {
    await adminRequest('/logout', { method: 'POST' })
    setAuth({ status: 'anonymous', user: null, error: '' })
  }, [])

  const value = useMemo(() => ({ ...auth, login, logout }), [auth, login, logout])
  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}
