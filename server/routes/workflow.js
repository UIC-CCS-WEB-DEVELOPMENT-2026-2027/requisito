import { Router } from 'express'
import { requireEditor, requireSession } from '../auth/middleware.js'
import { isAllowedSourceUrl } from '../config/sourceAllowlist.js'
import { decideVerificationRequest, recordVerificationRequest, restoreId } from '../db/records.js'
import { resolveRecordTypes } from './records.js'

function isPastOrTodayIsoDate(value, today) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value && value <= today
}

function nowDate(config) {
  return config.now ? config.now() : new Date()
}

function manilaDate(date) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

export function createWorkflowRouter({ db, config }) {
  const router = Router()
  router.use(requireSession)

  router.get('/review', (req, res) => {
    const requests = db.prepare(`
      SELECT vr.*, submitter.username AS requested_by_name, decider.username AS decided_by_name,
        r.type AS record_type, r.id AS record_id, r.data AS record_data,
        r.verification AS record_verification, r.last_verified AS record_last_verified
      FROM verification_requests vr
      JOIN users submitter ON submitter.id = vr.requested_by
      LEFT JOIN users decider ON decider.id = vr.decided_by
      JOIN records r ON r.type = vr.record_type AND r.id = vr.record_id
      WHERE vr.status = 'pending'
      ORDER BY vr.id
    `).all()
    return res.json({ requests: requests.map(({
      record_type,
      record_id,
      record_data,
      record_verification,
      record_last_verified,
      ...request
    }) => ({
      ...request,
      record: {
        ...JSON.parse(record_data),
        type: record_type,
        id: restoreId(record_id),
        verification: record_verification,
        lastVerified: record_last_verified,
      },
    })) })
  })

  router.get('/records/:type/:id/verification', (req, res) => {
    const types = resolveRecordTypes(req.params.type)
    if (!types) return res.status(400).json({ error: 'Unknown record type.' })
    const recordType = types.find((type) => db.prepare('SELECT 1 FROM records WHERE type = ? AND id = ?')
      .get(type, req.params.id))
    if (!recordType) return res.status(404).json({ error: 'Record not found.' })
    const requests = db.prepare(`
      SELECT vr.*, submitter.username AS requested_by_name, decider.username AS decided_by_name
      FROM verification_requests vr
      JOIN users submitter ON submitter.id = vr.requested_by
      LEFT JOIN users decider ON decider.id = vr.decided_by
      WHERE vr.record_type = ? AND vr.record_id = ?
      ORDER BY vr.id DESC
    `).all(recordType, req.params.id)
    const audit = db.prepare(`
      SELECT id, at, actor, action, previous, next, note
      FROM audit_log WHERE record_type = ? AND record_id = ?
      ORDER BY id DESC LIMIT 50
    `).all(recordType, req.params.id)
    return res.json({ requests, audit: audit.map((entry) => ({
      ...entry,
      previous: entry.previous ? JSON.parse(entry.previous) : null,
      next: entry.next ? JSON.parse(entry.next) : null,
    })) })
  })

  router.post('/records/:type/:id/verification', requireEditor, (req, res) => {
    const { source_url: sourceUrl, source_accessed_on: sourceAccessedOn, note } = req.body ?? {}
    const today = manilaDate(nowDate(config))
    const types = resolveRecordTypes(req.params.type)
    if (!types) return res.status(400).json({ error: 'Unknown record type.' })
    const recordType = types.find((type) => db.prepare('SELECT 1 FROM records WHERE type = ? AND id = ?')
      .get(type, req.params.id))
    if (!recordType) return res.status(404).json({ error: 'Record not found.' })
    if (!isAllowedSourceUrl(sourceUrl)) {
      return res.status(400).json({ error: 'Use HTTPS from a configured official source host.' })
    }
    if (!isPastOrTodayIsoDate(sourceAccessedOn, today)) {
      return res.status(400).json({ error: 'Source access date must be a valid date no later than today.' })
    }
    if (typeof note !== 'string' || note.trim().length < 10 || note.length > 2000) {
      return res.status(400).json({ error: 'Describe exactly what was compared in a note of 10 to 2000 characters.' })
    }
    const requestId = recordVerificationRequest(db, {
      type: recordType,
      id: req.params.id,
      userId: req.adminUser.id,
      actor: req.adminUser.username,
      sourceUrl,
      sourceAccessedOn,
      note: note.trim(),
      now: nowDate(config).toISOString(),
    })
    if (requestId === null) return res.status(404).json({ error: 'Record not found.' })
    if (requestId?.error === 'already_verified') {
      return res.status(409).json({ error: 'Edit the record before requesting another verification.' })
    }
    return res.status(201).json({ requestId, status: 'pending' })
  })

  router.post('/review/:requestId/decision', requireEditor, (req, res) => {
    const decision = req.body?.decision
    if (!['approved', 'rejected'].includes(decision)) {
      return res.status(400).json({ error: 'Decision must be approved or rejected.' })
    }
    const decisionNote = req.body?.note
    if (typeof decisionNote !== 'string' || decisionNote.trim().length < 10 || decisionNote.length > 2000) {
      return res.status(400).json({ error: 'Provide a substantive review note of 10 to 2000 characters.' })
    }
    const result = decideVerificationRequest(db, {
      requestId: Number(req.params.requestId),
      reviewer: req.adminUser,
      decision,
      decisionNote: decisionNote.trim(),
      now: nowDate(config).toISOString(),
    })
    if (result.error === 'self_decision') return res.status(403).json({ error: 'You cannot decide your own verification request.' })
    if (result.error === 'invalid_note') {
      return res.status(400).json({ error: 'Provide a substantive review note of 10 to 2000 characters.' })
    }
    if (result.error) return res.status(404).json({ error: 'Pending verification request not found.' })
    return res.json({ status: decision, record: result.record })
  })

  return router
}
