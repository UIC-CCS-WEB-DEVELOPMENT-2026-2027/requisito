# Production-readiness roadmap

This roadmap records the present boundaries and a safe order for further work.
It is not a certification that the prototype is production-ready. It is based
on the current repository structure and documented validation limits; each
phase needs a separate implementation scope and acceptance review.

## Current baseline

- The public app is a static React/Vite frontend using JSON catalogs.
- Public civic browsing does not require an account. Checklist answers and
  progress remain in browser-local storage.
- The admin API and SQLite database are local-development tooling. The admin
  API is loopback-bound and is not a deployed production service.
- Civic seed records remain unverified until the independent review workflow
  approves them. A source URL by itself is not evidence that every field is
  current.
- Goal requirements and document guides share canonical requirement records.
  Only First Job and Davao City Health Card currently have linked requirements;
  all linked evidence remains unverified or historically bounded.
- Privacy and terms copy are drafts. Filipino and Cebuano interface text still
  needs native-speaker review.
- HTTP integration tests that bind to `127.0.0.1` have previously been blocked
  by sandbox `listen EPERM`; those results must be rerun in an authorized
  environment before relying on endpoint-level coverage.
- On 2026-10-25, `npm test` discovered 159 tests: 150 passed and 9 HTTP
  integration tests failed before their assertions because localhost binding
  returned `listen EPERM`. The network-independent test selection passed
  150/150. A direct loopback probe and Vite startup attempt both returned the
  same sandbox `EPERM`; no alternate listener or security workaround was
  attempted. The server entry point is safe to import, and test cleanup is
  registered before listener startup.
- The production build now runs Vite with `NODE_ENV=production` in its child
  process. The measured main JavaScript chunk fell from 766.44 kB (197.75 kB
  gzip) to 571.26 kB (141.43 kB gzip). Adding a second SSS evidence record
  brings the current main chunk to 572.85 kB (141.76 kB gzip); the 500 kB
  warning remains, but the ineffective dynamic-import warning is gone. A vendor
  split was measured and rejected: it increased initial gzip by about 3.1 kB
  without reducing transferred code.
- Latest checks: network-independent tests passed 150/150; the catalog audit
  passed 219/219 records (all remain unverified); link audit and lint passed;
  production dependency audit reported 0 known vulnerabilities; the production
  build succeeded; and `git diff --check` passed. A current SSS member-application
  page and the separate SSS ID list were retrieved, but both source records
  remain unverified until independent review. The local browser walkthrough and
  HTTP integration assertions remain pending in an environment that permits
  localhost listeners; exact commands are documented in
  `docs/a11y-checklist.md`. Deployment-provider environment values were not
  inspected, and no deployment was performed.

## Ranked next work

### 1. Establish a trustworthy civic-content baseline

- Research Passport, NBI, driver licensing, and standalone SSS/PhilHealth
  journeys from current responsible-agency sources.
- Record exactly which claims each source supports, when it was checked,
  applicable categories, and unresolved details.
- Do not publish unsourced requirements or elevate verification status without
  the existing independent reviewer decision.
- Acceptance: catalog audit passes; every public goal has a truthful coverage
  state; each published requirement resolves to a canonical guide and source;
  no unverified field is described as confirmed.

### 2. Validate core public journeys

- Cover search across goals, canonical requirement guides, agencies, and
  official source records; ensure every result navigates to a real page or
  source.
- Verify goal-specific checklist generation, condition handling, browser-local
  persistence, guide return paths, and unsupported-goal states.
- Run representative desktop/mobile and keyboard journeys where browser
  tooling is available.
- Acceptance: focused automated tests and link/data audits pass; browser
  checks exercise direct navigation, refresh, progress, and goal isolation.
- Progress (2026-10-25): search now covers goals, canonical requirement
  guides, and linked official source records. Regression tests verify guide
  navigation, HTTPS source links, unverified status, and truthful empty
  results. Browser validation remains pending; the shared local page endpoint
  refused the connection during this run.

### 3. Re-run protected server behavior in an authorized test environment

- Execute the real HTTP integration tests without changing production
  authorization logic or bypassing sandbox restrictions.
- Verify session lifecycle, origin checks, lockout, role enforcement,
  independent two-person review, audit-log protections, and final-admin
  protection through their intended API paths.
- Acceptance: endpoint assertions execute and pass; retain exact test output
  and distinguish environment blocks from successful tests.

### 4. Decide the identity and persistence product boundary

- Do not imply that browser-local checklist state is account-backed.
- If cross-device accounts are desired, first approve a privacy/security
  design, ownership model, persistence provider, migration path, retention
  rules, backup/restore plan, and failure behavior.
- Keep document uploads out of scope until a separate data-protection design
  justifies them.
- Acceptance: documented data classification and deployment architecture
  match the actual implementation and tested guarantees.

### 5. Close accessibility, localization, and operational readiness

- Complete keyboard and screen-reader review, contrast and responsive checks,
  and native-speaker review of Filipino and Cebuano.
- Replace draft privacy/terms content only after appropriate review.
- Document supported browsers, environment configuration, monitoring,
  incident response, backup/recovery, and rollback for the actual deployment.
- Acceptance: evidence-backed review results and operational procedures exist;
  no draft or unavailable integration is presented as complete.

## Release gate

Do not describe Requisito as production-ready until the content review,
protected API testing, privacy/legal review, accessibility/localization
reviews, and deployment operations above have been completed and independently
checked. A successful local build alone is insufficient.
