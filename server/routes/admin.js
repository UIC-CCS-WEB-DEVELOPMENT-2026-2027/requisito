import { Router } from 'express'
import { requireRole, requireSession } from '../auth/middleware.js'
import { hashPassword, validatePassword } from '../auth/passwords.js'
import { appendAudit } from '../db/audit.js'

function nowIso(config) {
  return (config.now ? config.now() : new Date()).toISOString()
}

function userPublic(row) {
  return {
    id: row.id,
    username: row.username,
    role: row.role,
    disabled: Boolean(row.disabled),
    createdAt: row.created_at,
  }
}

export function createAdminRouter({ db, config }) {
  const router = Router()
  router.use(requireSession)

  router.get('/summary', (req, res) => {
    const totalRecords = db.prepare('SELECT COUNT(*) AS count FROM records').get().count
    const byType = db.prepare(`
      SELECT type, COUNT(*) AS count
      FROM records WHERE verification != 'verified'
      GROUP BY type ORDER BY type
    `).all()
    const pending = db.prepare(`
      SELECT COUNT(*) AS count FROM verification_requests WHERE status = 'pending'
    `).get().count
    const recentAudit = db.prepare(`
      SELECT id, at, actor, action, record_type, record_id, note
      FROM audit_log ORDER BY id DESC LIMIT 10
    `).all()
    return res.json({ totalRecords, unverifiedByType: byType, pendingRequests: pending, recentAudit })
  })

  router.get('/population-summary', (req, res) => {
    const barangays = db.prepare("SELECT data FROM records WHERE type = 'barangay'").all()
      .map((row) => JSON.parse(row.data))
    const cityFact = db.prepare("SELECT data, verification FROM records WHERE type = 'fact' AND id = 'population-2020'").get()
    const officialDescription = cityFact ? JSON.parse(cityFact.data).description : ''
    const populationMatch = officialDescription.match(/is\s+([\d,]+)/i)
    const officialTotal = populationMatch ? Number(populationMatch[1].replace(/,/g, '')) : null
    const populated = barangays
      .map((record) => record.population2020)
      .filter((value) => Number.isInteger(value) && value >= 0)
    const currentSum = populated.reduce((sum, value) => sum + value, 0)
    return res.json({
      currentSum,
      populatedCount: populated.length,
      officialTotal,
      difference: officialTotal == null ? null : currentSum - officialTotal,
      sourceVerification: cityFact?.verification ?? null,
    })
  })

  router.get('/users', requireRole('admin'), (req, res) => {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1)
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 50))
    const users = db.prepare(`
      SELECT id, username, role, disabled, created_at
      FROM users ORDER BY id LIMIT ? OFFSET ?
    `).all(limit, (page - 1) * limit)
    const total = db.prepare('SELECT COUNT(*) AS count FROM users').get().count
    return res.json({ users: users.map(userPublic), total, page, limit })
  })

  router.post('/users', requireRole('admin'), async (req, res) => {
    const { username, password, role } = req.body ?? {}
    if (typeof username !== 'string' || !/^[A-Za-z0-9._-]{3,50}$/.test(username.trim())) {
      return res.status(400).json({ error: 'Username must be 3 to 50 letters, numbers, dots, underscores, or hyphens.' })
    }
    if (!['viewer', 'reviewer', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Choose viewer, reviewer, or admin role.' })
    }
    try {
      validatePassword(password)
    } catch (error) {
      return res.status(400).json({ error: error.message })
    }
    const now = nowIso(config)
    try {
      const passwordHash = await hashPassword(password)
      db.exec('BEGIN IMMEDIATE')
      try {
      const result = db.prepare(`
        INSERT INTO users (username, password_hash, role, disabled, created_at)
        VALUES (?, ?, ?, 0, ?)
      `).run(username.trim(), passwordHash, role, now)
      const user = db.prepare('SELECT id, username, role, disabled, created_at FROM users WHERE id = ?')
        .get(Number(result.lastInsertRowid))
      appendAudit(db, {
        at: now,
        actor: req.adminUser.username,
        action: 'user.created',
        next: userPublic(user),
        note: 'Admin created a user account.',
      })
      db.exec('COMMIT')
      return res.status(201).json({ user: userPublic(user) })
      } catch (error) {
        db.exec('ROLLBACK')
        throw error
      }
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return res.status(409).json({ error: 'That username is already in use.' })
      }
      throw error
    }
  })

  router.patch('/users/:id', requireRole('admin'), (req, res) => {
    const userId = Number(req.params.id)
    db.exec('BEGIN IMMEDIATE')
    let updated
    try {
      const existing = db.prepare(`
        SELECT id, username, role, disabled, created_at FROM users WHERE id = ?
      `).get(userId)
      if (!existing) {
        db.exec('COMMIT')
        return res.status(404).json({ error: 'User not found.' })
      }
      const role = req.body?.role ?? existing.role
      const disabled = req.body?.disabled ?? Boolean(existing.disabled)
      if (!['viewer', 'reviewer', 'admin'].includes(role) || typeof disabled !== 'boolean') {
        db.exec('ROLLBACK')
        return res.status(400).json({ error: 'Role or disabled value is invalid.' })
      }
      if (existing.role === 'admin' && !existing.disabled && (role !== 'admin' || disabled)) {
        const activeAdmins = db.prepare(`
          SELECT COUNT(*) AS count FROM users WHERE role = 'admin' AND disabled = 0
        `).get().count
        if (activeAdmins <= 1) {
          db.exec('ROLLBACK')
          return res.status(409).json({ error: 'The last active admin cannot be disabled or demoted.' })
        }
      }
      const now = nowIso(config)
      updated = { ...existing, role, disabled: Number(disabled) }
      db.prepare('UPDATE users SET role = ?, disabled = ? WHERE id = ?')
        .run(role, disabled ? 1 : 0, userId)
      if (disabled) db.prepare('DELETE FROM sessions WHERE user_id = ?').run(userId)
      appendAudit(db, {
        at: now,
        actor: req.adminUser.username,
        action: 'user.updated',
        previous: userPublic(existing),
        next: userPublic(updated),
        note: 'Admin changed a user role or disabled state.',
      })
      db.exec('COMMIT')
    } catch (error) {
      db.exec('ROLLBACK')
      throw error
    }
    return res.json({ user: userPublic(updated) })
  })

  router.get('/audit', requireRole('admin'), (req, res) => {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1)
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 50))
    const entries = db.prepare(`
      SELECT id, at, actor, action, record_type, record_id, previous, next, note
      FROM audit_log ORDER BY id DESC LIMIT ? OFFSET ?
    `).all(limit, (page - 1) * limit).map((entry) => ({
      ...entry,
      previous: entry.previous ? JSON.parse(entry.previous) : null,
      next: entry.next ? JSON.parse(entry.next) : null,
    }))
    const total = db.prepare('SELECT COUNT(*) AS count FROM audit_log').get().count
    return res.json({ entries, total, page, limit })
  })

  return router
}
