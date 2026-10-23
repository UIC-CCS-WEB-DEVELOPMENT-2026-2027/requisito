import { Buffer } from 'node:buffer'
import { Router } from 'express'
import { rateLimit, ipKeyGenerator } from 'express-rate-limit'
import { appendAudit } from '../db/audit.js'
import {
  clearSessionCookie,
  createSession,
  deleteSession,
  findSession,
  readSessionToken,
  sessionCookie,
} from '../auth/sessions.js'
import { verifyPassword } from '../auth/passwords.js'

function nowDate(config) {
  return config.now ? config.now() : new Date()
}

function publicUser(user) {
  return { id: user.id, username: user.username, role: user.role }
}

export function createAuthRouter({ db, config }) {
  const router = Router()
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    keyGenerator: (req) => `${ipKeyGenerator(req.ip)}:${String(req.body?.username ?? '').trim().toLowerCase()}`,
    handler: (_req, res) => res.status(429).json({ error: 'Too many sign-in attempts. Try again later.' }),
  })

  router.post('/login', loginLimiter, async (req, res) => {
    const username = typeof req.body?.username === 'string' ? req.body.username.trim() : ''
    const submittedPassword = typeof req.body?.password === 'string' ? req.body.password : ''
    const password = Buffer.byteLength(submittedPassword, 'utf8') <= 1024 ? submittedPassword : ''
    const user = db.prepare(
      'SELECT id, username, password_hash, role, disabled FROM users WHERE username = ? COLLATE NOCASE',
    ).get(username)
    const passwordValid = await verifyPassword(password, user?.password_hash)
    if (!user || user.disabled || !passwordValid) {
      return res.status(401).json({ error: 'Username or password is incorrect.' })
    }

    const now = nowDate(config)
    db.exec('BEGIN IMMEDIATE')
    let session
    try {
      session = createSession(db, user.id, config.sessionSecret, now)
      appendAudit(db, {
        at: now.toISOString(),
        actor: user.username,
        action: 'auth.login',
        note: 'Admin session created.',
      })
      db.exec('COMMIT')
    } catch (error) {
      db.exec('ROLLBACK')
      throw error
    }
    res.setHeader('Set-Cookie', sessionCookie(session.token, config))
    return res.json({ user: publicUser(user) })
  })

  router.use((req, _res, next) => {
    const token = readSessionToken(req.headers.cookie)
    req.adminSession = findSession(db, token, config.sessionSecret, nowDate(config))
    req.adminUser = req.adminSession
      ? { id: req.adminSession.id, username: req.adminSession.username, role: req.adminSession.role }
      : null
    next()
  })

  router.get('/me', (req, res) => {
    if (!req.adminUser) return res.status(401).json({ error: 'Sign in is required.' })
    return res.json({ user: req.adminUser })
  })

  router.post('/logout', (req, res) => {
    deleteSession(db, readSessionToken(req.headers.cookie), config.sessionSecret)
    res.setHeader('Set-Cookie', clearSessionCookie(config))
    res.status(204).end()
  })

  return router
}
