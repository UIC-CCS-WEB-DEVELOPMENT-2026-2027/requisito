import { Buffer } from 'node:buffer'
import chat from '../netlify/functions/chat.js'

function toRequest(req) {
  const headers = new Headers()
  for (const [name, value] of Object.entries(req.headers ?? {})) {
    if (typeof value === 'string') headers.set(name, value)
    else if (Array.isArray(value)) headers.set(name, value.join(', '))
  }
  const host = typeof req.headers?.host === 'string' ? req.headers.host : 'localhost'
  const method = req.method ?? 'GET'
  const body = method === 'GET' || method === 'HEAD'
    ? undefined
    : typeof req.body === 'string' || Buffer.isBuffer(req.body)
      ? req.body
      : req.body === undefined ? undefined : JSON.stringify(req.body)

  return new Request(new URL(req.url ?? '/api/chat', `https://${host}`), {
    method,
    headers,
    body,
  })
}

export default async function handler(req, res) {
  const response = await chat(toRequest(req))
  res.statusCode = response.status
  response.headers.forEach((value, name) => res.setHeader(name, value))
  res.end(await response.text())
}
