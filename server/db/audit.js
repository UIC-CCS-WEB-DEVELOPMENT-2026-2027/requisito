export function appendAudit(db, entry) {
  db.prepare(`
    INSERT INTO audit_log (at, actor, action, record_type, record_id, previous, next, note)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    entry.at,
    entry.actor,
    entry.action,
    entry.recordType ?? null,
    entry.recordId == null ? null : String(entry.recordId),
    entry.previous == null ? null : JSON.stringify(entry.previous),
    entry.next == null ? null : JSON.stringify(entry.next),
    entry.note ?? '',
  )
}
