import readline from 'node:readline'
import { createInterface } from 'node:readline/promises'
import process from 'node:process'
import { databasePathFromEnv } from '../server/config.js'
import { hashPassword, validatePassword, verifyPassword } from '../server/auth/passwords.js'
import { appendAudit } from '../server/db/audit.js'
import { openDatabase } from '../server/db/openDatabase.js'

function askHidden(question) {
  if (!process.stdin.isTTY || typeof process.stdin.setRawMode !== 'function') {
    throw new Error('Password prompts require an interactive terminal.')
  }
  return new Promise((resolve, reject) => {
    process.stdout.write(question)
    readline.emitKeypressEvents(process.stdin)
    process.stdin.setRawMode(true)
    let value = ''
    const onKeypress = (character, key = {}) => {
      if (key.ctrl && key.name === 'c') {
        process.stdin.off('keypress', onKeypress)
        process.stdin.setRawMode(false)
        process.stdout.write('\n')
        reject(new Error('Cancelled.'))
      } else if (key.name === 'return' || key.name === 'enter') {
        process.stdin.off('keypress', onKeypress)
        process.stdin.setRawMode(false)
        process.stdout.write('\n')
        resolve(value)
      } else if (key.name === 'backspace') {
        value = value.slice(0, -1)
      } else if (!key.ctrl && !key.meta && character) {
        value += character
      }
    }
    process.stdin.on('keypress', onKeypress)
    process.stdin.resume()
  })
}

async function askLine(question) {
  const prompts = createInterface({ input: process.stdin, output: process.stdout, historySize: 0 })
  try {
    return await prompts.question(question)
  } finally {
    prompts.close()
  }
}

async function promptPassword(label) {
  const password = await askHidden(label)
  validatePassword(password)
  const confirmation = await askHidden('Confirm password: ')
  if (password !== confirmation) throw new Error('Passwords do not match.')
  return password
}

const db = openDatabase(databasePathFromEnv())
try {
  const adminCount = db.prepare("SELECT COUNT(*) AS count FROM users WHERE role = 'admin'").get().count
  let confirmedBy = 'bootstrap'
  if (adminCount > 0) {
    const currentUsername = (await askLine('Existing admin username: ')).trim()
    const currentPassword = await askHidden('Existing admin password: ')
    const existing = db.prepare(`
      SELECT id, username, password_hash, role, disabled FROM users
      WHERE username = ? COLLATE NOCASE
    `).get(currentUsername)
    if (!existing || existing.disabled || existing.role !== 'admin' ||
        !(await verifyPassword(currentPassword, existing.password_hash))) {
      throw new Error('An active admin must confirm this operation.')
    }
    confirmedBy = existing.username
  }
  const username = (await askLine('New username (3-50 letters, numbers, dot, underscore, hyphen): ')).trim()
  if (!/^[A-Za-z0-9._-]{3,50}$/.test(username)) throw new Error('Username format is invalid.')
  const role = adminCount === 0 ? 'admin' : await askLine('Role (viewer/reviewer/admin): ')
  if (!['viewer', 'reviewer', 'admin'].includes(role)) throw new Error('Role is invalid.')
  const password = await promptPassword('New password (minimum 12 characters): ')
  const passwordHash = await hashPassword(password)
  const now = new Date().toISOString()
  db.exec('BEGIN IMMEDIATE')
  try {
    const result = db.prepare(`
      INSERT INTO users (username, password_hash, role, disabled, created_at)
      VALUES (?, ?, ?, 0, ?)
    `).run(username, passwordHash, role, now)
    appendAudit(db, {
      at: now,
      actor: confirmedBy,
      action: 'user.created',
      next: { id: Number(result.lastInsertRowid), username, role, disabled: false },
      note: 'User created through interactive CLI.',
    })
    db.exec('COMMIT')
  } catch (error) {
    db.exec('ROLLBACK')
    throw error
  }
  console.log(`Created ${role} account "${username}".`)
} finally {
  db.close()
}
