export class AdminApiError extends Error {
  constructor(status, message) {
    super(message)
    this.name = 'AdminApiError'
    this.status = status
  }
}

export async function adminRequest(path, options = {}) {
  const method = options.method ?? 'GET'
  const headers = new Headers(options.headers)
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    headers.set('X-Requested-With', 'portal-admin')
  }
  if (options.body !== undefined) headers.set('Content-Type', 'application/json')
  const response = await fetch(`/api${path}`, {
    ...options,
    method,
    headers,
    credentials: 'same-origin',
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })
  if (response.status === 204) return null
  const data = await response.json()
  if (!response.ok) throw new AdminApiError(response.status, data.error ?? 'The request could not be completed.')
  return data
}
