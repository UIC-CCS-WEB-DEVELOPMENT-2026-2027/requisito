# Part 5 defense notes: local admin workflow

## What was added

- A local Express API and SQLite database isolated from the public static app.
- Interactive first-admin creation; no seeded accounts, passwords, or public
  sign-up.
- Salted scrypt password hashes, HMAC-hashed random session tokens, eight-hour
  HttpOnly cookies, rate-limited login, role checks, and same-origin request
  validation.
- Record editing, independent two-person verification, pending-review
  cancellation after edits, and an append-only audit history.
- A separate `/admin` interface for records, review, accounts, and audit
  history, plus explicit catalog import/export scripts.

## Why two people approve verification

A source URL alone is not proof. The submitter records which official source
they reviewed, when they accessed it, and which record fields they compared.
A different reviewer or admin makes the approval decision. The database
stores that source on the verified record and records each transition in the
audit log. Any later edit resets verification and cancels pending reviews.

## Why export is explicit

The admin database is a local work area. The public frontend reads its JSON
catalogs, not the database. `npm run db:export` is an explicit boundary: it
stages all catalogs, runs the data audit, then replaces the catalog files.
This prevents unreviewed database edits from silently changing the public
data. The maintainer still inspects the changes and runs `npm run check`.

## Demo auth and admin auth are different

The existing `/login` route remains an in-memory prototype protecting the
original goals/checklist/documents flow. The separate `/admin/login` route uses
the local API and is a real account/session workflow for local maintenance.
Public demo credentials are not sent to the admin API; admin credentials are
not exposed to frontend build variables.

## Limits and validation

This is not a production hosting design. It has no MFA, email recovery,
Internet-facing deployment, or automated backup service. The server binds to
loopback, and the SQLite database must be treated as private data. Automated
builds and tests verify behavior and structure, not the factual accuracy of
government records. HTTP integration tests require the declared server
dependencies to be installed.
