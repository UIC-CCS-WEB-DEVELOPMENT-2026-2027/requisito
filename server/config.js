import path from 'node:path'
import process from 'node:process'

const PLACEHOLDER_SECRET = 'replace-with-at-least-32-random-characters'

export function databasePathFromEnv(env = process.env) {
  const value = env.DATABASE_PATH?.trim() || '.local/requisito-admin.sqlite'
  return path.resolve(value)
}

export function loadConfig(env = process.env) {
  const port = Number(env.PORT ?? 8787)
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535.')
  }
  const sessionSecret = env.SESSION_SECRET ?? ''
  if (sessionSecret.length < 32 || sessionSecret === PLACEHOLDER_SECRET) {
    throw new Error('SESSION_SECRET must be set to at least 32 non-placeholder characters.')
  }
  const nodeEnv = env.NODE_ENV ?? 'development'
  if (!['development', 'test', 'production'].includes(nodeEnv)) {
    throw new Error('NODE_ENV must be development, test, or production.')
  }
  const allowedOrigin = env.APP_ORIGIN ?? 'http://localhost:5173'
  let origin
  try {
    origin = new URL(allowedOrigin)
  } catch {
    throw new Error('APP_ORIGIN must be a valid HTTP(S) origin.')
  }
  if (!['http:', 'https:'].includes(origin.protocol) || origin.origin !== allowedOrigin) {
    throw new Error('APP_ORIGIN must contain only the HTTP(S) origin, without a path.')
  }
  return Object.freeze({
    port,
    databasePath: databasePathFromEnv(env),
    sessionSecret,
    nodeEnv,
    allowedOrigin: origin.origin,
    secureCookies: nodeEnv === 'production',
  })
}
