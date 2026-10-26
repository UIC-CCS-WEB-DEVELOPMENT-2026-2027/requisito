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
- Public civic-information routes include the goal catalog and details,
  checklist planning, document guides, and public search. Checklist progress
  stays in the current browser profile; browsing or tracking it does not create
  an account or sync data to a server.
- The `/admin/*` interface is separate from those public routes and requires a
  server-backed admin session. Record review, verification decisions, user
  management, and other privileged operations remain protected by server
  middleware and role checks; frontend visibility is not an authorization
  boundary. The frontend route manifest does not define admin routes.
- `viewer` can read admin records and summaries. `reviewer` can edit records
  and submit or decide verification requests. `admin` also manages accounts
  and reads the paginated audit log. The server enforces roles even if a user
  bypasses the interface.
- At least one active admin must remain. The check and account update are
  serialized in one immediate SQLite transaction.
- A verification request must cite an HTTPS URL on the server's exact
  official-host allowlist and provide a valid access date and comparison note.
  The authenticated submitter cannot approve or reject their own request; the
  server enforces this for every decision, including direct API calls, and
  obtains the deciding account ID from the authenticated session rather than
  request data. Only a different account with reviewer or admin permission can
  decide it. Distinct account IDs do not establish distinct real-world
  identities; an administrator/coordinator must assign and track separate
  people operationally. Edits reset verified records and cancel pending
  requests so old evidence cannot approve changed data.
- The audit table is protected against update and delete operations by SQLite
  triggers. Record and account mutations write audit entries in their
  transactions.

## Public assistant boundary

- The assistant function accepts only short text, a whitelisted interface
  language, and an optional service `type`/`slug` reference. It resolves that
  reference against server-owned records instead of accepting client record
  content.
- Normal provider input contains verified records only. User and record text
  are treated as untrusted data, and returned citation IDs are re-resolved on
  the server before sources are shown.
- The response validator refuses URLs, dates, detected personal information,
  unsupported numeric tokens, and citations that do not resolve to supplied
  records. This is not a semantic fact checker; non-numeric hallucinations
  remain possible.
- The handler applies an in-memory limit of 10 requests per IP per minute and a
  configurable `DAILY_LIMIT_PER_IP` limit (default 100, allowed range 1-10000)
  using the Manila calendar day. Serverless instances do not share counters, so
  these limits are abuse speed bumps rather than hard quotas.
- The public UI sends only the latest question and selected language; it does
  not send prior conversation messages. The handler does not log question text
  or page context. Provider availability and third-party prompt processing
  remain privacy and reliability considerations.
- `scripts/eval-assistant.mjs` is plan-only by default. `--live` is required
  before its evaluation loop makes local-function or provider requests.

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
