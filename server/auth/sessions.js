import { createHmac, randomBytes } from 'node:crypto'

const SESSION_MS = 8 * 60 * 60 * 1000
const COOKIE_NAME = 'requisito_admin'

export function hashToken(token, secret) {
  return createHmac('sha256', secret).update(token).digest('hex')
}

export function sessionCookie(token, { secureCookies, maxAge = SESSION_MS } = {}) {
  const secure = secureCookies ? '; Secure' : ''
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(maxAge / 1000)}${secure}`
}

export function clearSessionCookie({ secureCookies } = {}) {
  const secure = secureCookies ? '; Secure' : ''
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`
}

export function readSessionToken(cookieHeader = '') {
  for (const part of cookieHeader.split(';')) {
    const [key, ...value] = part.trim().split('=')
    if (key === COOKIE_NAME) {
      try {
        return decodeURIComponent(value.join('='))
      } catch {
        return null
      }
    }
  }
  return null
}

export function createSession(db, userId, secret, now = new Date()) {
  const token = randomBytes(32).toString('base64url')
  const expiresAt = new Date(now.getTime() + SESSION_MS).toISOString()
  db.prepare('DELETE FROM sessions WHERE user_id = ?').run(userId)
  db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(now.toISOString())
  db.prepare('INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)')
    .run(hashToken(token, secret), userId, expiresAt, now.toISOString())
  return { token, expiresAt }
}

export function findSession(db, token, secret, now = new Date()) {
  if (!token) return null
  return db.prepare(`
    SELECT sessions.id AS session_id, users.id, users.username, users.role, users.disabled
    FROM sessions JOIN users ON users.id = sessions.user_id
    WHERE sessions.id = ? AND sessions.expires_at > ? AND users.disabled = 0
  `).get(hashToken(token, secret), now.toISOString()) ?? null
}

export function deleteSession(db, token, secret) {
  if (token) db.prepare('DELETE FROM sessions WHERE id = ?').run(hashToken(token, secret))
}
