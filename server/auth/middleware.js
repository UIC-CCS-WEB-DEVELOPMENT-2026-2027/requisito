const ROLE_LEVEL = Object.freeze({ viewer: 1, reviewer: 2, admin: 3 })

export function requireSession(req, res, next) {
  if (!req.adminUser) return res.status(401).json({ error: 'Sign in is required.' })
  next()
}

export function requireRole(role) {
  return (req, res, next) => {
    if (!req.adminUser) return res.status(401).json({ error: 'Sign in is required.' })
    if (ROLE_LEVEL[req.adminUser.role] < ROLE_LEVEL[role]) {
      return res.status(403).json({ error: `This page requires the ${role} role.` })
    }
    next()
  }
}

export function requireEditor(req, res, next) {
  if (!req.adminUser) return res.status(401).json({ error: 'Sign in is required.' })
  if (!['reviewer', 'admin'].includes(req.adminUser.role)) {
    return res.status(403).json({ error: 'Reviewer or admin role required.' })
  }
  next()
}

export function requireCsrf(config) {
  return (req, res, next) => {
    if (req.get('X-Requested-With') !== 'portal-admin') {
      return res.status(403).json({ error: 'Missing required request header.' })
    }
    if (req.get('Origin') !== config.allowedOrigin) {
      return res.status(403).json({ error: 'Request origin is not allowed.' })
    }
    next()
  }
}
