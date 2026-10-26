# Civic portal implementation log

## Reference patterns observed

BetterMakati's route pages are in `src/pages/`; its structured sources and
features are implemented in the corresponding source files below. Its
citizen-facing editorial content is in `content/services/` and
`content/government/`.

| Reference feature | Implementing reference file(s) | Tier in this build |
| --- | --- | --- |
| Service and hotline directories/guides | `src/pages/Services.tsx`, `src/pages/ServiceGuide.tsx`, `src/pages/Hotlines.tsx`, `src/data/serviceDirectory.ts`, `src/data/serviceGuideDetails.ts` | 1 |
| Barangays and profiles | `src/pages/Barangays.tsx`, `src/pages/BarangayProfile.tsx`, `src/data/barangays.ts` | 1 |
| City profile and updates | `src/pages/About.tsx`, `src/pages/News.tsx`, `src/pages/Today.tsx` | 1 |
| Government offices / official profiles | `src/pages/GovernmentOffices.tsx`, `src/pages/OfficialProfile.tsx` | 1 |
| Search and project status | `src/pages/Search.tsx`, `src/pages/ProjectStatus.tsx`, `src/data/searchIndex.ts` | 1 |
| Citizen correction contribution | `src/components/civic/CivicContributionForm.tsx` | 1 |
| Content authoring guidance | `CONTENT-GUIDE.md`, `CONTENT-MANAGEMENT.md` | 1 (adapted as docs) |
| Automated source freshness | `scripts/check-sources.mjs`, `.github/workflows/source-freshness.yml` | 2 (not implemented) |
| History and timeline | `src/pages/History.tsx`, `src/data/civicTimeline.ts` | 2 (not implemented) |
| Budget dashboard | `src/pages/ProjectsBudget.tsx`, `src/data/budget2025.ts` | 2 (not implemented) |
| Accountability | `src/pages/Accountability.tsx`, `src/data/accountability.ts` | 3 (README pitch only) |
| Participation | `src/pages/Participate.tsx`, `src/data/participation.ts` | 3 (README pitch only) |
| Elections | `src/pages/Elections.tsx`, `src/data/electionCivic.ts` | 3 (README pitch only) |
| City Monitor | `src/pages/CityMonitor.tsx`, `src/data/cityMonitor.ts` | 3 (README pitch only) |
| Integrity | `src/pages/Integrity.tsx`, `src/data/integrityDisclosures.ts` | 3 (README pitch only) |

The reference also has civic briefs, calendar, public records, maps, mobility,
heritage, and community-tool pages. They are outside this requested Tier 1
scope, so they are not implemented or ported.

## Requisito implementation plan

- Routes: `/services`, `/services/:slug`, `/barangays`, `/barangays/:slug`, `/about-davao`, `/updates`, `/officials`, `/search`, `/status`, and `/contribute`.
- Components: shared record verification/source metadata, service and barangay cards, correction form, and language switcher; reuse `Layout`, `EmptyState`, `StatusBadge`, and existing page/card styles.
- Data: `services.json`, `barangays.json`, `officials.json`, `cityFacts.json`, and `updates.json`; extend the existing requirements catalog only for the Davao health-card goal.
- Helpers: copy-returning directory helpers and grouped `searchAll`; a read-only audit and a CSV-to-JSON barangay import script.

## Risks and guardrails

- Avoid route and CSS collisions with the existing goal/checklist/document flow; keep its auth gates unchanged.
- Every seed item remains unverified with `lastVerified: null`; do not present sample barangays as actual city data.
- Keep the assistant's verified-only policy and its existing requirement record adapter intact.
- The reference is read-only. Its TypeScript/Tailwind components and Davao-unrelated content are patterns only, not code or copy to transplant.
- Route refreshes depend on the existing deployment SPA fallback; local visual route checks are skipped per user instruction, with build and Node tests used instead.

## Part 2 parity implementation

The remaining requested data-driven pages now use the same catalog and
verification conventions:

- `/history`, `/briefs`, `/budget`, `/procurement`, `/monitor`, `/elections`,
  `/accountability`, `/participate`, `/integrity`, and `/officials/:slug`.
- `history.json`, `budget.json`, and `procurement.json` remain empty until the
  maintainer provides sourced data. The only election entry is the unverified
  COMELEC official-site link. Accountability is empty by design.
- `scripts/source-watch.mjs` hashes normalized page content, compares
  `data/source-watch-state.json`, and writes a human-review report. The workflow
  proposes a review PR through GitHub CLI. No network scan or workflow run was
  performed; only `--dry-run` was executed.
- Budget/procurement CSV importers are built with Node built-ins, retain
  unverified state, and are covered by fixture-string tests.
- The monitor derives counts, gaps, stale data, time-sensitive records, and
  source-watch results from local catalogs. It does not scrape news or score
  public officials.
- `docs/parity-matrix.md` records implemented features and explicit omissions
  where Davao data, privacy policy, or backend capabilities are unavailable.

## Part 4 frontend completion

- Added `/districts` and `/districts/:name`, URL-driven barangay filters and
  CSV export, and URL-driven ranked global search with safe match highlighting.
- Centralized dashboard and audit totals; Home's unverified count is derived
  from the non-sample gaps in the Status report. The four illustrative document
  tracker entries remain outside the audit total.
- Added route lazy loading, translated remaining interface labels, reusable
  empty states, visible focus and responsive styles. Locale keys match across
  English, Filipino, and Bisaya; Filipino and Bisaya still need native review.
- `npm run build`: passed. Production output contains 537,163 bytes of
  JavaScript across 36 chunks and 26,702 bytes of CSS across 3 chunks.
- `node --test`: 62 tests passed.
- No dev server was started or stopped. No manual desktop, 360px, or browser
  route checks were performed; see `docs/a11y-checklist.md`.

## Part 5 local admin workflow

- Added a loopback-only Express API with SQLite persistence, salted scrypt
  passwords, hashed eight-hour sessions, role checks, CSRF/origin checks, and
  login rate limiting. The first admin is created interactively; no account or
  password is seeded.
- Added record editing, exact-host source checks, two-person verification,
  pending-review cancellation after edits, an append-only audit log, and
  explicit staged import/export scripts. Export runs the project data audit
  before replacing JSON catalogs.
- Added a lazy `/admin` workspace for login, dashboard, record search/edit,
  review queue, admin user management, and audit history. The public site and
  demo sign-in remain separate.
- Added temporary-database core, HTTP integration, and catalog import/export
  tests. HTTP tests require the declared Express dependencies; they are skipped
  until those packages are installed.
- Added the setup, security, and defense documentation in
  `docs/admin-runbook.md`, `docs/security-notes.md`, and
  `docs/defense-notes-part5.md`.
- Final checks: `npm run lint` passed; `npm run check` passed with all 218 data
  records passing audit and the production build succeeding; `node --test`
  reported 75 passed, 0 failed, and 9 HTTP tests skipped because the declared
  server dependencies are not installed.
- The local API is not deployed. No browser/server route walkthrough, secret
  creation, data export, or catalog verification was performed.

## Part 6 route, empty-state, and assistant safeguards

- Added a shared route manifest for public routes, header/footer navigation, and
  route links. Added localized breadcrumbs in the shared layout, with dynamic
  labels for service, barangay, district, and official detail pages.
- Added empty feature catalogs without sample civic records, verified-guide
  filtering, public service/where-to-go finders, and explicit empty states.
  Source links are labeled unverified and limited to HTTPS `.gov.ph` hosts.
- Improved the assistant's handling of page context, untrusted record text,
  unsupported numeric claims, and configurable in-memory daily limits. Added
  `DAILY_LIMIT_PER_IP=100` to `.env.example`; no `.env` file was read or changed.
- `npm run lint` passed. It prints a non-fatal Browserslist warning about the
  parent directory's `package.json`.
- `npm run audit:links` passed for 61 JSX files, 59 public routes, and 7 admin
  routes. `node scripts/audit-data.mjs` passed: 218/218 records passed, all 218
  remain unverified, with 0 validation errors; all 12 new feature arrays remain
  empty.
- `node --test server/catalogScripts.test.mjs` passed all 4 tests after the
  exporter was updated to include `featureCatalogs.json` in its isolated audit
  fixture.
- `npm run build` passed. Vite reported an existing large-chunk warning and a
  dynamic import that is also statically imported.
- The full `npm run check` could not complete: integration tests that bind
  `127.0.0.1` were denied by the sandbox (`listen EPERM`). The same test run
  initially exposed the missing isolated `featureCatalogs.json` fixture,
  corrected above and verified separately. No loopback workaround was used.
- No development server was started, no live assistant/provider request was
  made, and no manual browser or 360px check was performed. The reference
  directory was not modified.

## Phase 2 requirements and document guidance

- Replaced the former `/documents` personal tracker with a searchable guide
  directory and detail pages. Goal details, checklist items, search results,
  and guides resolve the same canonical requirement IDs; one guide links back
  to every applicable goal and displays goal-specific conditions.
- Added explicit mandatory, conditional, and recommended requirement types,
  applicant questions, four checklist progress states, browser-local progress,
  and revision warnings. Progress does not imply agency approval and does not
  sync between accounts or devices.
- Added source metadata and a prioritized
  `docs/requirements-research-queue.md`. Current evidence is limited to an
  unverified, historical Davao City health-card announcement, SSS coverage and
  number guidance from an official FAQ, and the narrow PhilHealth
  direct-contributor eligibility statement. Other priority services remain
  incomplete rather than being filled with unsupported instructions.
- `node scripts/audit-data.mjs`: 219/219 records passed; all 219 remain
  unverified, with 0 validation errors.
- `npm run audit:links`: passed for 63 JSX files, 61 public routes, and 7
  admin routes.
- Focused requirement, plan, rendering, localization, route, catalog, and
  non-network admin tests: 48 passed; the nullable-copy-count assistant test
  also passed separately.
- `npm run lint` and `npm run build` passed. The build retains the existing
  large-chunk and ineffective dynamic-import warnings.
- `npm test`: 126 passed and 9 failed because server HTTP integration tests
  could not bind `127.0.0.1` (`listen EPERM`) under the sandbox. No workaround
  was attempted. Route smoke checks ran through Vite middleware; visual browser
  and responsive-viewport checks could not run without a local HTTP listener.

## Phase 3 first-job readiness

- Audited and narrowed the First Job goal to its six canonical employer- or
  employment-dependent checklist entries; Davao health-card items remain
  exclusively in the separate goal because the January announcement does not
  establish current applicability.
- Added SSS official FAQ evidence for lifetime SS Numbers, employer reporting,
  and the first contribution needed for employed-worker coverage. Added the
  PhilHealth formal-members and online-services source limits. Neither source
  supplies a complete first-time enrollment checklist.
- Pag-IBIG presented an access challenge; BIR pages could not be retrieved.
  Their checklists, fees, timing, and filing responsibilities remain unknown.
  Employer-requested birth certificates and NBI clearances are identified as
  conditional, not universal government requirements.
- Updated applicant questions and source-missing notices, preserved changed
  requirement IDs with revision increments, and added first-job regression
  coverage for goal membership, conditions, source metadata, and guide links.
- Validation: focused first-job/flow/localization/route and non-network review
  tests passed (45/45); `npm run lint`, `npm run build`,
  `npm run audit:links`, and `node scripts/audit-data.mjs` passed. The data
  audit reports 219/219 records passing, all unverified, with zero validation
  errors. `npm test` reported 127 passed and 9 failures, all server HTTP
  integration tests denied `127.0.0.1` binding by the sandbox (`listen EPERM`).
  No networking workaround was attempted.
