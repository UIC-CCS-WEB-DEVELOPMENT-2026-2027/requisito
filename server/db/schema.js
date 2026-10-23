export const schemaSql = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  username TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('viewer', 'reviewer', 'admin')),
  disabled INTEGER NOT NULL DEFAULT 0 CHECK (disabled IN (0, 1)),
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON sessions(expires_at);
CREATE TABLE IF NOT EXISTS records (
  type TEXT NOT NULL,
  id TEXT NOT NULL,
  data TEXT NOT NULL,
  verification TEXT NOT NULL,
  last_verified TEXT,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (type, id)
);
CREATE TABLE IF NOT EXISTS verification_requests (
  id INTEGER PRIMARY KEY,
  record_type TEXT NOT NULL,
  record_id TEXT NOT NULL,
  requested_by INTEGER NOT NULL REFERENCES users(id),
  source_url TEXT NOT NULL,
  source_accessed_on TEXT NOT NULL,
  note TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  decided_by INTEGER REFERENCES users(id),
  decided_at TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (record_type, record_id) REFERENCES records(type, id)
);
CREATE INDEX IF NOT EXISTS verification_requests_status_idx ON verification_requests(status, id);
CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY,
  at TEXT NOT NULL,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  record_type TEXT,
  record_id TEXT,
  previous TEXT,
  next TEXT,
  note TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS audit_record_idx ON audit_log(record_type, record_id, id DESC);
CREATE TRIGGER IF NOT EXISTS audit_log_no_update
BEFORE UPDATE ON audit_log BEGIN
  SELECT RAISE(ABORT, 'audit_log is append-only');
END;
CREATE TRIGGER IF NOT EXISTS audit_log_no_delete
BEFORE DELETE ON audit_log BEGIN
  SELECT RAISE(ABORT, 'audit_log is append-only');
END;
`
