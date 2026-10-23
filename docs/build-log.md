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
