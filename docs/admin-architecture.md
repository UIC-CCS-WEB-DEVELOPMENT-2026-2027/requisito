# Admin architecture

The public app remains a static React/Vite site. A separately started local
Express API and SQLite database serve only the admin interface. No admin
credentials, session tokens, or database files are committed. Vite proxies
`/api` to the API during local development; deployments must arrange a
same-origin reverse proxy or same-site hosting for the API.

## Folders and entry points

- `server/index.js`: validates environment config, opens the configured SQLite
  database, and starts the API listener.
- `server/app.js`: `createApp({ db, config })`, middleware, API routes, and
  error responses; it does not listen.
- `server/db/`: schema, prepared statements, record import/export and audit
  validation.
- `server/auth/`: scrypt password handling, session cookies, role checks, and
  CSRF/origin checks.
- `server/routes/`: auth, records, verification, users, and audit endpoints.
- `server/config/sourceAllowlist.js`: exact official source hosts from the
  source documentation.
- `src/admin/`: separately lazy-loaded admin pages and API client; no admin
  UI is part of a public route.
- `scripts/admin-create.mjs`, `scripts/db-import.mjs`, and
  `scripts/db-export.mjs`: interactive setup and explicit catalog transfer.

## API routes

All state-changing routes require the `X-Requested-With: portal-admin` header
and a matching configured `Origin`. Authenticated data and account mutations
also require a valid session; login and logout are the unauthenticated
exceptions. Authentication is cookie-based (`HttpOnly`, `SameSite=Lax`,
`Secure` in production); the database stores only a hash of each session token.

- `GET /api/me`, `POST /api/login`, `POST /api/logout`
- `GET /api/admin/summary`, `GET /api/admin/population-summary`
- `GET /api/records`, `GET /api/records/:type/:id`,
  `PATCH /api/records/:type/:id`
- `GET /api/records/:type/:id/verification`,
  `POST /api/records/:type/:id/verification`
- `GET /api/review`, `POST /api/review/:requestId/decision`
- `GET /api/admin/users`, `POST /api/admin/users`,
  `PATCH /api/admin/users/:id` (admin only)
- `GET /api/admin/audit` (admin only, read-only and paginated)

Login is rate-limited. The CLI is the only first-admin bootstrap path. There is
no public sign-up, password reset, CORS policy, or email delivery.

## Database tables

- `users`: unique username, scrypt hash, role, disabled flag, creation time.
- `sessions`: token hash, user foreign key, expiry, creation time.
- `records`: catalog type and ID, full JSON data, verification/date fields,
  update time.
- `verification_requests`: target record, submitter, HTTPS source and access
  date, comparison note, decision state and reviewer metadata.
- `audit_log`: append-only actor/action, target, timestamp, previous/next JSON,
  and note. No API or server code updates or deletes audit rows.

## Role matrix

| Capability | Viewer | Reviewer | Admin |
| --- | --- | --- | --- |
| Read admin pages, records, requests, and audit summary | Yes | Yes | Yes |
| Edit unverified record fields | No | Yes | Yes |
| Submit or decide verification requests | No | Yes | Yes |
| Manage users and view paginated audit log | No | No | Yes |

At least one active admin must always remain. The last-admin check and update
run in one immediate SQLite transaction, so concurrent account changes cannot
remove the final active admin.

## Two-person verification flow

```text
Reviewer reads record and official source
  -> submits HTTPS source, access date, and exact comparison note
  -> request waits as pending; record remains unverified
  -> a different reviewer/admin approves or rejects
  -> approval updates the reviewed source URL, verification/date, and audit log
  -> export validates every catalog, then writes stable JSON to src/data/
```

Any later edit to verified record data returns it to unverified and adds an
audit entry. An edit also cancels pending requests for that record, since their
comparison notes no longer describe the edited data. Population edits require a
non-negative integer or null, a source, and a note. The imported catalogs
remain unchanged until the maintainer explicitly runs the exporter after
review. The exporter validates staged files before replacing any catalog and
restores originals if a write fails.
