import express from 'express'
import helmet from 'helmet'
import { createAuthRouter } from './routes/auth.js'
import { createRecordsRouter } from './routes/records.js'
import { createWorkflowRouter } from './routes/workflow.js'
import { createAdminRouter } from './routes/admin.js'
import { requireCsrf } from './auth/middleware.js'
import { findSession, readSessionToken } from './auth/sessions.js'

export function createApp({ db, config }) {
  if (!db || !config?.sessionSecret || !config?.allowedOrigin) {
    throw new Error('createApp requires a database and validated configuration.')
  }
  const app = express()
  app.disable('x-powered-by')
  app.use(helmet())
  app.use(express.json({ limit: '100kb', strict: true }))
  app.use((req, res, next) => {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      return requireCsrf(config)(req, res, next)
    }
    next()
  })
  app.use('/api', (req, _res, next) => {
    const token = readSessionToken(req.headers.cookie)
    const session = findSession(
      db,
      token,
      config.sessionSecret,
      config.now ? config.now() : new Date(),
    )
    req.adminUser = session
      ? { id: session.id, username: session.username, role: session.role }
      : null
    next()
  })
  app.use('/api', createAuthRouter({ db, config }))
  app.use('/api/records', createRecordsRouter({ db, config }))
  app.use('/api', createWorkflowRouter({ db, config }))
  app.use('/api/admin', createAdminRouter({ db, config }))
  app.use('/api', (_req, res) => res.status(404).json({ error: 'API route not found.' }))
  app.use((error, _req, res, next) => {
    void next
    if (error?.type === 'entity.too.large') {
      return res.status(413).json({ error: 'Request body exceeds the 100 KB limit.' })
    }
    if (error instanceof SyntaxError && 'body' in error) {
      return res.status(400).json({ error: 'Request body must contain valid JSON.' })
    }
    console.error('Admin API request failed.')
    return res.status(500).json({ error: 'The request could not be completed.' })
  })
  return app
}
