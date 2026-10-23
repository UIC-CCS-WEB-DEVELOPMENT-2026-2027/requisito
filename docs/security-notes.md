# Local admin security notes

The admin API is a local-development tool, not a production identity service.
It binds to `127.0.0.1`, has no public sign-up or password-reset endpoint, and
does not send account data to a third party. Do not expose this process to a
network or deploy the SQLite configuration as a public backend.

## Credentials and sessions

- There are no default, seeded, or committed accounts. `npm run admin:create`
  creates the initial admin from an interactive terminal prompt.
- Passwords must be at least 12 characters and are stored as salted scrypt
  hashes. Login responses contain only public account fields.
- Session tokens are random and stored in SQLite only as HMAC-SHA256 hashes
  keyed with `SESSION_SECRET`. Sessions expire after eight hours and are
  rotated at login. Cookies are `HttpOnly` and `SameSite=Lax`; production
  configuration additionally sets `Secure`.
- Login is limited to five attempts per IP address and normalized username per
  15-minute window. Unknown usernames and invalid passwords use the same error.
- New database directories are created with owner-only permissions and
  database files are set to owner read/write. `.local/` and `.env` are ignored
  by Git.

## Request and role boundaries

- The API listens on loopback and accepts state-changing requests only when
  both `Origin` matches `APP_ORIGIN` and
  `X-Requested-With: portal-admin` is present. It does not enable CORS.
- `viewer` can read admin records and summaries. `reviewer` can edit records
  and submit or decide verification requests. `admin` also manages accounts
  and reads the paginated audit log. The server enforces roles even if a user
  bypasses the interface.
- At least one active admin must remain. The check and account update are
  serialized in one immediate SQLite transaction.
- A verification request must cite an HTTPS URL on the server's exact
  official-host allowlist and provide a valid access date and comparison note.
  Its submitter cannot approve it. Edits reset verified records and cancel
  pending requests so old evidence cannot approve changed data.
- The audit table is protected against update and delete operations by SQLite
  triggers. Record and account mutations write audit entries in their
  transactions.

## Operational limits

This setup does not provide MFA, email recovery, remote administration,
automated encrypted backups, or production monitoring. It does not prove that
an official source is accurate: people must compare the record fields
themselves, and a second reviewer must independently decide. The exporter
validates catalog data before writing, but a maintainer must inspect changes
and run the project checks.

The public frontend remains static and does not receive the admin secret.
`SESSION_SECRET` belongs only in the ignored server-side `.env`, must be
unique and at least 32 characters, and must never use a `VITE_` name. The
local SQLite database contains account hashes, sessions, civic records, and
audit information; protect and back it up as private operational data.
