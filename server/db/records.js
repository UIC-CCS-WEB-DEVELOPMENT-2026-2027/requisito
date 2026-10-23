import { appendAudit } from './audit.js'
import { isAllowedSourceUrl } from '../config/sourceAllowlist.js'

export function parseRecord(row) {
  if (!row) return null
  return {
    ...JSON.parse(row.data),
    type: row.type,
    id: restoreId(row.id),
    verification: row.verification,
    lastVerified: row.last_verified,
  }
}

export function restoreId(id) {
  const numeric = Number(id)
  return Number.isSafeInteger(numeric) && String(numeric) === id ? numeric : id
}

export function getRecord(db, type, id) {
  return parseRecord(db.prepare(
    'SELECT type, id, data, verification, last_verified FROM records WHERE type = ? AND id = ?',
  ).get(type, String(id)))
}

export function listRecords(db, { type, district, verification } = {}) {
  const rows = db.prepare(`
    SELECT type, id, data, verification, last_verified
    FROM records
    WHERE (? IS NULL OR type = ?)
      AND (? IS NULL OR verification = ?)
    ORDER BY type, id
  `).all(type ?? null, type ?? null, verification ?? null, verification ?? null)
  const records = rows.map(parseRecord)
  return district
    ? records.filter((record) => record.adminDistrict === district)
    : records
}

export function insertRecord(db, record, now) {
  const data = { ...record }
  const { type, id } = data
  const verification = data.verification ?? 'unverified'
  const lastVerified = data.lastVerified ?? null
  delete data.type
  delete data.id
  delete data.verification
  delete data.lastVerified
  db.prepare(`
    INSERT OR IGNORE INTO records (type, id, data, verification, last_verified, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(type, String(id), JSON.stringify(data), verification, lastVerified, now)
}

export function editRecord(db, {
  type,
  id,
  data,
  sourceUrl,
  note,
  actor,
  now,
}) {
  db.exec('BEGIN IMMEDIATE')
  try {
    const existing = getRecord(db, type, id)
    if (!existing) {
      db.exec('COMMIT')
      return null
    }
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new Error('Record data must be an object.')
    }
    const nextData = { ...existing, ...data }
    const populationChanged = type === 'barangay' &&
      nextData.population2020 !== existing.population2020
    if (type === 'barangay' && nextData.population2020 !== null &&
        (!Number.isInteger(nextData.population2020) || nextData.population2020 < 0)) {
      throw new Error('population2020 must be a non-negative integer or null.')
    }
    if (populationChanged && (!sourceUrl || !note?.trim())) {
      throw new Error('Changing population2020 requires a source URL and note.')
    }
    if (populationChanged && !isAllowedSourceUrl(sourceUrl)) {
      throw new Error('Population changes require an HTTPS URL from a configured official source host.')
    }
    const previous = { ...existing }
    const nextVerification = existing.verification === 'verified' ? 'unverified' : existing.verification
    const nextLastVerified = nextVerification === 'verified' ? existing.lastVerified : null
    delete nextData.type
    delete nextData.id
    delete nextData.verification
    delete nextData.lastVerified
    if (populationChanged) nextData.sourceUrl = sourceUrl
    db.prepare(`
      UPDATE records
      SET data = ?, verification = ?, last_verified = ?, updated_at = ?
      WHERE type = ? AND id = ?
    `).run(JSON.stringify(nextData), nextVerification, nextLastVerified, now, type, String(id))
    const updated = getRecord(db, type, id)
    appendAudit(db, {
      at: now,
      actor,
      action: existing.verification === 'verified' ? 'record.edited.reset-verification' : 'record.edited',
      recordType: type,
      recordId: id,
      previous,
      next: updated,
      note: note.trim(),
    })
    const pendingRequests = db.prepare(`
      SELECT id, source_url, source_accessed_on, note
      FROM verification_requests
      WHERE record_type = ? AND record_id = ? AND status = 'pending'
    `).all(type, String(id))
    db.prepare(`
      UPDATE verification_requests SET status = 'cancelled', decided_at = ?
      WHERE record_type = ? AND record_id = ? AND status = 'pending'
    `).run(now, type, String(id))
    for (const request of pendingRequests) {
      appendAudit(db, {
        at: now,
        actor,
        action: 'verification.cancelled-by-edit',
        recordType: type,
        recordId: id,
        previous: { id: request.id, status: 'pending', sourceUrl: request.source_url },
        next: { id: request.id, status: 'cancelled' },
        note: 'Record data changed after the verification request was submitted.',
      })
    }
    db.exec('COMMIT')
    return updated
  } catch (error) {
    db.exec('ROLLBACK')
    throw error
  }
}

export function recordVerificationRequest(db, {
  type,
  id,
  userId,
  sourceUrl,
  sourceAccessedOn,
  note,
  actor,
  now,
}) {
  db.exec('BEGIN IMMEDIATE')
  try {
    const record = getRecord(db, type, id)
    if (!record) {
      db.exec('ROLLBACK')
      return null
    }
    if (record.verification === 'verified') {
      db.exec('ROLLBACK')
      return { error: 'already_verified' }
    }
    const result = db.prepare(`
      INSERT INTO verification_requests
        (record_type, record_id, requested_by, source_url, source_accessed_on, note, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)
    `).run(type, String(id), userId, sourceUrl, sourceAccessedOn, note, now)
    appendAudit(db, {
      at: now,
      actor,
      action: 'verification.requested',
      recordType: type,
      recordId: id,
      previous: null,
      next: { id: Number(result.lastInsertRowid), sourceUrl, sourceAccessedOn, note, status: 'pending' },
      note,
    })
    db.exec('COMMIT')
    return Number(result.lastInsertRowid)
  } catch (error) {
    db.exec('ROLLBACK')
    throw error
  }
}

export function decideVerificationRequest(db, {
  requestId,
  reviewer,
  decision,
  now,
}) {
  db.exec('BEGIN IMMEDIATE')
  try {
    const request = db.prepare(
      "SELECT * FROM verification_requests WHERE id = ? AND status = 'pending'",
    ).get(requestId)
    if (!request) {
      db.exec('ROLLBACK')
      return { error: 'not_found' }
    }
    if (request.requested_by === reviewer.id && decision === 'approved') {
      db.exec('ROLLBACK')
      return { error: 'self_approval' }
    }
    const before = getRecord(db, request.record_type, request.record_id)
    if (!before) {
      db.exec('ROLLBACK')
      return { error: 'record_not_found' }
    }
    const changed = db.prepare(`
      UPDATE verification_requests
      SET status = ?, decided_by = ?, decided_at = ?
      WHERE id = ? AND status = 'pending'
    `).run(decision, reviewer.id, now, requestId)
    if (Number(changed.changes) !== 1) {
      db.exec('ROLLBACK')
      return { error: 'not_found' }
    }
    let after = before
    if (decision === 'approved') {
      const data = JSON.parse(db.prepare('SELECT data FROM records WHERE type = ? AND id = ?')
        .get(request.record_type, request.record_id).data)
      data.sourceUrl = request.source_url
      const verifiedDate = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Manila',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date(now))
      db.prepare(`
        UPDATE records SET data = ?, verification = 'verified', last_verified = ?, updated_at = ?
        WHERE type = ? AND id = ?
      `).run(JSON.stringify(data), verifiedDate, now, request.record_type, request.record_id)
      after = getRecord(db, request.record_type, request.record_id)
      const otherPending = db.prepare(`
        SELECT id, source_url FROM verification_requests
        WHERE record_type = ? AND record_id = ? AND status = 'pending' AND id != ?
      `).all(request.record_type, request.record_id, request.id)
      db.prepare(`
        UPDATE verification_requests SET status = 'cancelled', decided_at = ?
        WHERE record_type = ? AND record_id = ? AND status = 'pending' AND id != ?
      `).run(now, request.record_type, request.record_id, request.id)
      for (const pending of otherPending) {
        appendAudit(db, {
          at: now,
          actor: reviewer.username,
          action: 'verification.cancelled-after-approval',
          recordType: request.record_type,
          recordId: request.record_id,
          previous: { id: pending.id, status: 'pending', sourceUrl: pending.source_url },
          next: { id: pending.id, status: 'cancelled' },
          note: 'Another verification request for this record was approved.',
        })
      }
    }
    appendAudit(db, {
      at: now,
      actor: reviewer.username,
      action: `verification.${decision}`,
      recordType: request.record_type,
      recordId: request.record_id,
      previous: before,
      next: {
        record: after,
        request: {
          id: request.id,
          sourceUrl: request.source_url,
          sourceAccessedOn: request.source_accessed_on,
          submittedBy: request.requested_by,
          status: decision,
        },
      },
      note: request.note,
    })
    db.exec('COMMIT')
    return { request: { ...request, status: decision, decided_by: reviewer.id, decided_at: now }, record: after }
  } catch (error) {
    db.exec('ROLLBACK')
    throw error
  }
}
