# Release checklist

Latest execution results: [26 October completion report](completion-validation-2026-10-26.md).
The historical snapshots below retain earlier limitations; PDF extraction, HTTP
tests, browser execution and chunk splitting were subsequently completed. The
strict government publication gate remains BLOCKED.

Status checked: 2026-10-26. This checklist records evidence and blockers; a
green build alone does not establish release readiness.

## MVP readiness is separate from verified publication

Run `npm run check:mvp` for the structural/data audits, lint, network-independent
tests, production build, and MVP safety assessment. An `MVP_READY` result means
the First Job flow has the required catalog structure, official source links,
clear qualifications for unresolved claims, and localized non-approval
notices. It is for demonstration and controlled MVP testing only.

The result also reports the existing government verification gate separately.
`PRODUCTION_VERIFICATION_PENDING` does not mean its evidence is complete: inspect
`governmentVerificationGate` for the strict gate's actual `BLOCKED`, `PENDING`,
or `PASS` result. MVP readiness never verifies government guidance or authorizes
deployment. HTTP integration tests and Playwright browser tests remain
unexecuted where local listener restrictions apply; run `npm test` and
`npm run test:e2e` in CI before relying on those results. Do not use an MVP-ready
result as approval for a public pilot or public launch.

### Vercel deployment boundary

The documented public target is Vercel. The public MVP consists of the Vite
single-page application and the `/api/chat` serverless function. First Job
catalogues and checklist logic ship to the browser; answers and progress are
stored in that browser's local storage and are not synced to an account.
`server/index.js` and its SQLite-backed admin API are local/internal tools, not
part of the Vercel deployment. Do not expose that API or assume its SQLite file
is durable in a serverless environment. The admin review workflow needs a
separate approved hosting and persistent-storage design before being operated
as a hosted service.

## 1. Verified and completed

- [x] Goal progress summaries use the same answer-filtered requirement plan as
  the checklist; storage read failures are surfaced as unavailable instead of
  appearing as an empty, usable checklist.
- [x] The non-network suite
  (`node --test src/tests/*.test.js src/tests/*.test.mjs scripts/*.test.mjs
  server/auth/*.test.mjs server/core.test.mjs server/index.test.mjs
  server/catalogScripts.test.mjs api/chat.test.mjs`) passed: 164 tests,
  0 failed. This is not the complete `npm test` result; the nine HTTP tests
  were not rerun because this environment is known to block loopback listeners.
- [x] Added a separate MVP readiness assessment and
  `npm run check:mvp`. The assessment can return `MVP_READY` for demonstrations
  and controlled testing while independently reporting
  `PRODUCTION_VERIFICATION_PENDING` and the strict First Job gate's actual
  `BLOCKED` result. The strict government publication gate is unchanged.
- [x] `npm run lint`, `node scripts/audit-data.mjs`,
  `npm run audit:links`, and `npm audit` passed; the full dependency audit
  reported zero vulnerabilities.
- [x] Fixed the server-rendered Goals regression test to provide an isolated
  browser-storage stub, and relaxed the provider-timeout test's attempt-count
  assertion so it checks actual abort/deadline behavior without assuming
  multiple timers fire under concurrent test load.
- [x] Applied shared typography, spacing, radius, focus, card, and responsive
  navigation refinements. The UI uses a native system font stack (no external
  font download); the Goals page description was shortened in all three
  locales without changing requirement or verification meaning.
- [x] `npm run build` passed. It still reports one 578.13 kB minified shared
  JavaScript chunk (142.93 kB gzip), above Vite's 500 kB warning threshold.
  The warning is recorded rather than suppressed; route-level lazy loading is
  already configured, and no measured initial-load improvement justified a
  wider data-loading refactor.
- [x] Added a government verification inventory distinguishing the 219 audited
  civic/catalog records from the separate 11-entry source register (10 linked
  to First Job). No status was promoted; all 219 records and all 11
  source-register records remain unverified.
- [x] Strengthened catalog audits and the two-person approval record: verified
  records now need a separate reviewer ID, review request, source-access date,
  review date, independent-decision marker, and substantive note. Requirements
  must reference at least one existing source. Source entries older than 365
  days fail the data audit. This validates structure, not factual accuracy or
  live URL availability.
- [x] Added six First Job claim-level evidence packages and a machine-enforced
  release gate. The gate distinguishes PASS, PENDING, BLOCKED, and EXCLUDED,
  validates every requirement/source relationship, requires complete evidence
  for included claims, checks required locale disclaimers, and rejects
  incomplete or invalid independent-review metadata.
- [x] Added the source-register catalog to admin import, review, edit, and
  export. The existing two-person workflow now supports source records;
  exact official hosts for the researched First Job sources are allowlisted.
  Regression tests cover review approval, source identity, export, and audit.
- [x] Added a reportable First Job source disposition to the release-gate
  output. All 10 linked source records currently await approval; no approval
  or verification status was fabricated.
- [x] The admin review queue now fetches current source records from the
  database instead of displaying potentially stale static copies. It shows
  evidence completeness, current source limitations, affected claim passages,
  and the current record verification state.
- [x] The release-gate report lists actionable blockers per requirement and
  source instead of returning a blank issue list for incomplete evidence.
- [x] Excluded records cannot make the gate pass while they remain in the
  public catalog. Each exclusion needs a reason, and the gate blocks until the
  public data path actually withholds it.
- [x] Replaced the repeated technical “Not yet verified” badge on requirement
  cards with an action-oriented confirmation message in English, Filipino,
  and Cebuano. It preserves the uncertainty warning.
- [x] The SSS "Be an SSS Member" page was retrieved on 2026-10-25. It supports
  the online/branch E-Center routes, the five-calendar-day continuation link,
  optional supporting-document upload in that described flow, and employer
  reporting effective from the first day of employment. It does not state a
  fee or employer-specific deadline.
- [x] PhilHealth's formal-economy page was retrieved on 2026-10-25 and supports
  direct-contributor classification for workers with an employee-employer
  relationship; it does not establish first-time registration steps.
- [x] The NBI Citizen's Charter page supports limited two-ID and service-path
  claims; its date, fee currency, and Davao applicability remain unconfirmed.
  The NBI portal and BIR ORUS remain destination shells, not evidence for
  current transaction instructions.
- [x] The Official Gazette RA 11261 article page and PDF link were accessible
  on 2026-10-26. The PDF text itself was not extracted or reviewed. Exact
  section wording is cross-checked only against a Lawphil transcription; an
  independent reviewer must inspect the official PDF and current
  implementation before approval.
- [x] On 2026-10-26, PhilHealth's formal-economy member page and its linked
  member-category page were retrieved. They support limited worker-category
  claims only; no first-time enrollment procedure is inferred.

## 2. Implemented but awaiting validation

- [x] `npm run test:e2e -- --list` discovers 12 Playwright cases across desktop
  Chromium and a mobile Chromium
  viewport, including first-job goal selection, conditional filtering,
  progress persistence, document navigation, unsupported goals, keyboard skip
  navigation, official-link destinations, localization, storage failure
  feedback, browser history, and viewport overflow at 320, 375, 768, 1024, and
  1440 pixels. The suite itself is still unexecuted here.
- [x] `.github/workflows/ci.yml` runs lint, catalog/link checks, all Node tests,
  the production build, a full dependency audit, and the Playwright
  suite. It installs Chromium with OS dependencies and retains Playwright
  screenshots/traces on failure. The workflow has not yet been observed
  passing on GitHub.
- [ ] The nine HTTP integration tests in `server/app.test.mjs` and browser
  tests have not executed in this sandbox. The nine HTTP integration tests
  failed to start with `listen EPERM`; the Playwright command terminated before
  test execution with a Host/authority mismatch (`127.0.0.1:57200` versus
  `127.0.0.1:4173`). The suites require local loopback listeners:
  the integration harness binds `127.0.0.1` on an ephemeral port, and the
  Playwright web server binds `127.0.0.1:4173`. The observed `listen EPERM`
  comes from this environment's socket restriction, not a production port
  configuration defect. No attempt was made to bypass it.
- [ ] The affected server tests are: "HTTP login succeeds, failures are
  generic, and responses never expose passwords"; "login attempts lock out
  after five failures for the same IP and username"; "logout invalidates
  sessions and expired sessions are rejected"; "every role is checked against
  read, edit, verify, review, and admin-only routes"; "state-changing requests
  require the portal header and matching Origin"; "verification decisions
  enforce independent reviewers through the API"; "record edits reject
  non-HTTPS source URLs without changing stored data"; "the final active admin
  cannot be disabled or demoted"; and "no submitted password is returned or
  logged during login failures or user creation."
- [x] `vercel.json` pins the Vite build/output and the documented SPA
  deep-link rewrite. `.vercelignore` excludes the internal Express/SQLite
  admin API and local database/environment files. A local structural test
  checks this configuration. It was not validated by a Vercel build or live
  deployment; confirm the project settings, environment variables, and
  `/api/chat` behavior in the authorized Vercel project before release. No
  deployment was attempted.
- [ ] Visual review at 320, 375, 768, 1024, and 1440 px, including clipping,
  touch targets, and native-speaker review of Filipino and Cebuano, still
  requires a real browser and human review. Opening the built `file://` page
  in the shared browser produced a blank page because local assets returned
  HTTP 403; no screenshot review is claimed.
- [ ] `npm run audit:first-job-release` currently reports `BLOCKED`: one
  requirement is pending independent approval and five have insufficient
  evidence. This is an intentional release stop, not a test failure. The
  release-gate test suite passes, but live government claims remain pending.
- [ ] Execute validation on a developer machine or CI runner that permits
  loopback networking:

  ```sh
  npm ci
  npm run lint
  npm run check
  npx playwright install --with-deps chromium
  npm run test:e2e
  ```

  The HTTP tests use an ephemeral local port. Playwright starts Vite on
  `127.0.0.1:4173`; no public listener or firewall exception is required.
  The `.github/workflows/ci.yml` workflow runs on pushes and pull requests and
  supports manual runs: open the repository's **Actions** tab, select **CI**,
  choose **Run workflow**, select the intended branch, and confirm. It runs
  `npm ci`, `npm audit`, lint, `npm run check` (catalog/link audits, full Node
  suite, and build), then installs Chromium and executes Playwright. A test
  listing is discovery only; it is not evidence that browser cases passed.

## 3. Blocked by external dependencies or government verification

- [ ] The government-information inventory contains 219 audited civic/catalog
  records and 11 source-register records (10 linked to First Job; one Davao
  health-card record is out of scope). All remain unverified. These are not
  230 individually verified source records.
  One city fact lacks a source URL. See the
  [government verification inventory](./government-verification-inventory.md).
- [ ] The NBI Citizen's Charter supports limited service-path and ID claims,
  but its current validity, fees, processing information, and Davao office
  details remain unresolved. The portal shell alone does not establish
  applicant rules.
- [ ] Pag-IBIG's official membership-registration page returned a browser
  challenge. No first-time employee process, eligibility, documents, fees, or
  employer/applicant responsibilities are claimed.
- [ ] BIR's ORUS landing shell did not expose the employee TIN route. Confirm
  current BIR registration rules and who files before describing a procedure.
- [ ] The PSA request-page URL could not be retrieved because of a transport
  failure. Verify that the URL is current and establish the birth-certificate
  request channel, documents, charges, delivery, and representative rules.
- [ ] The official RA 11261 article page confirms the Act title/date and links
  a PDF, but the PDF text was not read. A one-time fee waiver, covered
  transactions, proof requirements, statutory exceptions, and implementation
  must be checked against official text before being stated as facts.
- [ ] The current first-time PhilHealth enrollment process and employer/applicant
  responsibilities remain unconfirmed despite the newly checked member
  category page. The Davao health-card record is based on a dated announcement
  and also remains unverified.
- [ ] All first-job source and requirement records remain `unverified`; use
  separate submitter and reviewer accounts in the admin two-person workflow.
  Reviewers must inspect the claim package and source passage, not merely
  approve an accessible URL.
- [ ] The release gate remains blocked until unsupported BIR, PSA, Pag-IBIG,
  PhilHealth, NBI-local, and statutory implementation details are resolved or
  explicitly excluded from publication with reviewer-approved scope.
- [ ] No deployment or production-host verification has been performed.

### Next actions for an independent reviewer

1. Resolve the evidence gaps in the
   [First Job research queue](./requirements-research-queue.md). For claims
   that cannot be confirmed, narrow or withhold the claim; do not treat an
   inaccessible page or secondary transcription as official evidence.
2. Import the current catalog into the authorized review environment. A
   submitter must request review of each linked source record, and a different
   authorized reviewer must inspect the cited passage, source date, agency,
   limitations, and claim before deciding.
3. Review each of the six requirement packages separately. Record a
   substantive note and source-access date; do not approve a URL alone.
4. Export reviewed records and run `npm run check` and
   `npm run audit:first-job-release`. Release only if the gate reports `PASS`;
   `PENDING`, `BLOCKED`, or `EXCLUDED` is not approval.
5. Complete the blocked HTTP/browser and live-host checks above before any
   production release.

The latest gate result is `BLOCKED`: requirements 1, 2, 4, 5, and 6 are blocked
by unresolved evidence; requirement 3 has sufficient evidence only for limited
claims and awaits independent approval. All 10 First Job-linked source records
are pending independent approval. No requirements or source records were
promoted to verified.
