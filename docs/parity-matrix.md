# BetterMakati-to-Requisito feature parity

This comparison uses the reference app's route registration in
`_reference-bettermakati/src/App.tsx`, route navigation in
`src/data/navigation.ts`, its page/component/data families, and checked-in
Playwright tests. It compares those behaviors with Requisito's current
`src/routeManifest.js`, React pages, `src/data` catalogs, tests, and the
project's static-prototype and source-review constraints. The reference
repository was inspected read-only; its code, branding, and Makati information
are not copied.

**Parity statuses describe feature scope, not whether a route renders.**

- **Complete** — a comparable supported Davao user function exists and is
  covered by local evidence.
- **Partial** — a narrower substitute exists, or the data, interaction, or
  route coverage is incomplete.
- **Missing** — no comparable behavior is present.
- **N/A** — the specific reference feature is Makati-specific or outside this
  paperwork-pathfinder's intended scope.
- **Blocked** — completing it safely needs reviewed Davao data or policy that
  the repository does not have.

Reference paths below account for all 56 route patterns, redirects, and the
catch-all registered in `App.tsx`. Multiple paths share a row only when their
Requisito destination and limitation are the same.

| BetterMakati route / feature evidence | Requisito route, code, data, and tests | Status and evidence-based comparison |
| --- | --- | --- |
| `/` Home (`pages/Home.tsx`, home search/services components) | `/`, `src/pages/Home.jsx`, `src/data/helpers.js`; route smoke and data tests | **Partial** — Davao home and catalog search exist, but not the reference's service discovery breadth or verified local guide coverage. |
| `/about` About (`pages/About.tsx`) | `/about-davao`, `src/pages/AboutDavao.jsx`, `src/data/cityFacts.json` | **Partial** — Davao counterpart exists; source records remain unverified. |
| `/privacy` | `/privacy`, `FeaturePage` draft | **Partial** — clearly marked draft; no reviewed policy text. |
| `/terms` | `/terms`, `FeaturePage` draft | **Partial** — clearly marked draft; no reviewed terms. |
| `/services` | `/services`, `src/pages/Services.jsx`, `ServiceCard`, `services.json`; filter, Maps-rendering, and route tests | **Partial** — search/category/sort and map actions work, but the seven-record catalog is unverified and lacks reviewed transaction guides. |
| `/services/:category` | `/services` category selector | **Partial** — category filtering exists in-page, not as an equivalent category route/deep-link. |
| `/services/:category/:documentSlug` | `/services/:slug`, `ServiceDetail.jsx` | **Partial** — service detail pages exist, but no structured category/document transaction route or verified requirements dataset. |
| `/services/guide/:id` | `/service-guides`, `ServiceGuideFinder`, `GuideCard`, `briefs.json` | **Blocked** — only complete verified guides are shown; there are currently no approved verified briefs, so results are honestly empty. |
| Government offices (`/government-offices`) | `/officials`, `/services`, `officials.json`, `services.json` | **Partial** — offices and services are separate and source-linked; office holders and service records remain unverified. |
| `/community-tools` | `/community-tools`, `FeaturePage`, empty `featureCatalogs.json` collection | **Blocked** — no reviewed Davao tools directory or source-backed entries. |
| `/community-tools/saan-ako-lalapit` guided concern finder | `/concern-finder`, `FeaturePage` | **Blocked** — route is an honest empty state; no reviewed Davao decision rules or referral dataset. General `/search` is not equivalent. |
| `/contact` | `/contact`, `FeaturePage`, `OfficialSourceLeads` | **Partial** — directory leads are shown as unverified and contact submission is explicitly disabled/unconfigured. |
| `/hotlines` | `/services`, hotline rows in `services.json` | **Partial** — hotlines are searchable with services but have no dedicated hotline route; numbers require review. |
| `/search` | `/search`, `src/data/search.js`, `searchAll`; `civicData.test.js`, `route-smoke.test.mjs` | **Complete for local catalog search; partial for reference parity** — searches available Davao records and preserves query/type, but does not include the reference's typo-tolerant guided problem-to-agency flow. |
| `/get-involved` | `/participate`, `src/pages/Participate.jsx` | **Partial** — source-aware participation guidance exists; no equivalent reviewed Davao activity directory or submissions. |
| `/participate` | `/participate`, `src/pages/Participate.jsx` | **Partial** — safe guidance exists, while unsupported contact actions remain unavailable. |
| `/government` | `/government`, `FeaturePage` | **Partial** — links to separate officials/services sources; not a populated combined, verified government directory. |
| `/barangays` | `/barangays`, `src/pages/Barangays.jsx`, `barangays.json`; barangay tests | **Partial** — searchable directory works, but names and district assignments are an unverified secondary-source compilation and populations are absent. |
| `/barangays/:slug` | `/barangays/:slug`, `BarangayProfile.jsx` | **Partial** — profiles render with district context; source data is not officially verified and the reference's selected-barangay scope is not carried across journeys. |
| `/officials/:slug` | `/officials/:slug`, `OfficialProfile.jsx`, `officials.json` | **Partial** — route and profile exist; holder/term remain hidden unless verified, and no current verified officeholder dataset is supplied. |
| `/elections` | `/elections`, `Elections.jsx`, `elections.json` | **Partial** — source-link page exists; the supplied COMELEC link/summary is not verified election guidance or a current Davao election dataset. |
| `/legislation` | `/legislation`, `FeaturePage`, empty `publicRecords` collection | **Blocked** — no sourced Davao ordinances/resolutions have been supplied; no laws were fabricated. |
| `/statistics` | `/statistics`, `FeaturePage`, `/status`, `/monitor` | **Partial** — status/monitor derive counts from local catalogs; this is not the reference's city-indicator/statistics dataset or comparison dashboard. |
| `/history` | `/history`, `History.jsx`, empty `history.json` | **Blocked** — route is available, but no dated, sourced history entries are supplied. |
| `/today` | `/status`, `/monitor` (no `/today` route) | **Partial** — local catalog status offers a constrained counterpart; there is no daily current-city feed or dedicated Today experience. |
| `/news` | `/updates`, `Updates.jsx`, `updates.json` | **Partial** — source-linked updates page exists; it is not a live or comprehensive news product and records are unverified. |
| `/live` | `/live`, `FeaturePage`, empty `events` collection | **Blocked** — no verified live feed/event source; no scraping or live social feed is claimed. |
| `/calendar` and `/whats-on` redirect | `/calendar` empty feature page; no `/whats-on` alias | **Blocked** — no complete verified Davao calendar; the reference redirect alias is absent. |
| `/briefs` | `/briefs`, `Briefs.jsx`, `briefs.json`, verified-guide filter | **Partial** — source-based brief display exists, but supplied records remain unverified and cannot serve as approved process instructions. |
| `/reports` and `/reports/:slug` | `/reports`, `/reports/:slug`, `FeaturePage`, empty `reports` collection | **Blocked** — list/detail shells render empty/not-published states; no approved Davao editorial reports/cases. |
| `/reports/makati-overview` redirect | No equivalent Davao report | **N/A** — this is a reference-specific Makati report and is not reproduced. |
| `/accountability` | `/accountability`, `Accountability.jsx`, empty `accountability.json` | **Blocked** — page and schema exist; no reviewed official documents have been supplied. |
| `/records` and `/records/:id` | `/public-records`, `/public-records/:slug`, `FeaturePage`, empty `publicRecords` | **Blocked** — route shells exist, but not the reference's searchable public-record archive; no Davao records were supplied. |
| `/projects-budget` | `/budget`, `Budget.jsx`, `budget.json`, CSV importer | **Blocked** — importer/dashboard structure exists but catalog is empty until official source files are reviewed. |
| `/status` | `/status`, `Status.jsx`, `getStatusReport`; data and route tests | **Complete for local source/verification status; partial for reference parity** — current verification gaps derive from local catalogs, not a live external monitor. |
| `/city-monitor` | `/monitor`, `Monitor.jsx`, `getCityMonitor` | **Partial** — local derived monitor exists, with no source scraping, government score, or live feed. |
| `/city-monitor/:id` | No equivalent route; metadata appears in monitor/status pages | **Missing** — there is no individual monitor-record detail route. |
| `/open-government` | `/integrity`, `/status`, `/accountability` (no combined route) | **Partial** — methods and source gaps are disclosed across pages; no combined open-government dashboard or full records dataset. |
| `/integrity` | `/integrity`, `Integrity.jsx` | **Complete for project methods/disclosure; partial for civic-data breadth** — disclosures and derived coverage exist, but the source catalogs remain incomplete/unverified. |
| `/transparency` redirect | No compatibility alias; related `/budget`, `/integrity`, `/status` routes | **Missing** — no legacy alias route; no Makati data is copied. |
| `/civic-map` | `/map`, `FeaturePage`, empty `mapLocations` | **Blocked** — no verified Davao location dataset; a blank map or invented pins would mislead. |
| `/civic-map/reports` | `/nearby-reports`, `FeaturePage`, empty `reports` | **Blocked** — no local report feed, location collection, or moderation system. |
| `/civic-map/audits/park-accessibility-2026` | `/civic-audit`, empty `civicAuditEntries` | **Blocked** — no approved Davao observation protocol or reviewed evidence; Makati pilot data is not reused. |
| `/civic-map/audits/park-accessibility-2026/results` | `/civic-audit/results`, empty `civicAuditEntries` | **Blocked** — results are unavailable without approved observations and a publication/review policy. |
| `/civic-map/report` | `/civic-reports` empty page; `/contribute` only prepares a GitHub correction issue | **Blocked** — no public report intake, moderation, privacy controls, or Davao case data. A correction issue is not a civic report. |
| `/civic-map/:assetId` | `/assets`, empty `assets` collection; no detail route | **Blocked** — no reviewed asset inventory or asset details. |
| `/visit` | `/tourism`, `FeaturePage`, empty `tourismPlaces` | **Blocked** — Davao-specific venues/hours/access information require sourced data; Makati places are not copied. |
| `/mobility` | `/mobility`, `FeaturePage`, empty `transitRoutes` | **Blocked** — no verified Davao route/schedule dataset. |
| `/cinemas` | `/cinemas`, `FeaturePage`, empty `cinemas` | **Blocked** — no verified venue catalogue. |
| `/heritage` | `/heritage`, `FeaturePage`, empty `heritageSites` | **Blocked** — no reviewed Davao heritage source set. |
| `/estates` | `/estates`, `FeaturePage`, empty `estateListings` | **N/A** — real-estate listings are outside the paperwork-pathfinder scope; do not create a Davao market feed. |
| `/parking` redirect | No equivalent | **N/A** — Makati parking/visit compatibility path has no approved Davao counterpart. |
| `*` not-found route | `*`, `NotFound.jsx`; route smoke test | **Complete** — unknown routes render the app's not-found page. |
| Reference compatibility redirects (`/whats-on`, `/reports/makati-overview`, `/transparency`, `/parking`) | Only `/questions` redirects to `/checklist`; no matching legacy aliases | **Partial** — local question-flow compatibility remains; reference-specific aliases are not all carried over. |
| National-service handoff / external service links (`NationalServiceHandoff.tsx`) | Services/source links, no equivalent shared handoff component | **Partial** — individual source links can be opened, but there is no structured, verified national-agency handoff workflow. |
| API-backed civic reports, observations, and feedback (`api/civic*.js`, `api/feedback.js`) | No public contribution API; `/contribute` drafts an external GitHub issue | **N/A under current approved architecture** — public backend/submission endpoint is outside the prototype scope; do not add it without a separate privacy/security policy. |
| Places/news external APIs (`api/places.js`, `api/news.js`) | Static JSON catalogs and intentionally empty feature catalogs | **N/A under current data policy** — no API keys or live feeds; adding one would not establish authoritative Davao claims. |
| Shared responsive shell, page loading/boundaries, SEO and keyboard support | `Layout`, `App`, `routeManifest`, CSS, link audit; browser-checked Maps at phone/desktop | **Partial** — common shell, loading state, semantic navigation and focus treatments exist; Requisito does not have equivalent broad Playwright/axe regression coverage for every route and viewport. |
| Language selection and runtime persistence | `LanguageContext`, `en.json`, `fil.json`, `ceb.json`, `i18nCatalog.test.js` | **Partial** — three catalogs and key parity are tested; Filipino/Cebuano translations need native review and there is no equivalent browser persistence E2E suite. |
| Barangay scope (`useBarangayScope.ts`, scoped links across guide journeys) | Barangay profiles and district links; no selected-scope state | **Missing** — selection is not propagated into services, guides, or civic results. |

## Reference interaction and test evidence

The reference has five checked-in E2E suites:

- `tests/e2e/critical-paths.spec.mjs`: route smoke/redirects/deep links; service
  and search journeys; records, budgets, accountability, monitor, civic map,
  and barangay-scope paths.
- `tests/e2e/accessibility.spec.mjs`: axe/semantic and keyboard scenarios.
- `tests/e2e/responsive-accessibility.spec.mjs`: mobile reflow and responsive
  accessibility checks.
- `tests/e2e/runtime-smoke.spec.mjs`: runtime bootstrap.
- `tests/e2e/language-runtime.spec.mjs`: language selection and persistence.

These are **checked-in test cases, not test results from this sprint**. The
current Requisito suite provides Node tests for core data, filtering, source
status, conditional requirement planning, Maps rendering, route manifest,
route smoke, and static links/accessibility. It does not prove feature
equivalence with BetterMakati or replace native-speaker and source review.

## Citizen-problem priorities and sprint outcome

| Priority | User problem and evidence | Safe solution / outcome | Success test |
| --- | --- | --- | --- |
| 1. Know which documents apply | The January 2026 City Health Office notice distinguishes general health-card items from food-industry and pink-card conditions; the old Requisito list treated all entries as equal. | Added explicit `applicability`, source-backed `when` conditions and localized situational questions. “Not sure” keeps a conditional item visible; only an explicit “No” removes it. Every record remains unverified and the page warns that the source is historical. | `planGenerator.test.js` checks default/yes/no filtering; `checklistRendering.test.mjs` checks rendered questions and uncertainty; `audit-data.mjs` checks that condition keys/values are valid. |
| 2. Avoid relying on false ordering | The source does not establish document-to-document prerequisites. | Checklist explicitly states that displayed order is not an official sequence. No dependency edge is inferred or added. | Checklist-rendering regression asserts the warning; plan tests continue to validate only explicitly modeled dependency behavior. |
| 3. Find the responsible office | Applicants need to confirm current details with the responsible Davao office before travel. | The health-card checklist links through the centralized route helper to the City Health Office detail/source page; existing map links remain available only for usable address fields and retain the unverified warning. | SSR checklist and Maps card/detail tests verify the office link and map states. |
| 4. Avoid dead ends for unsupported goals | Passport, NBI, driver's license, and other placeholder goals have no reviewed requirements; “No requirements found” could imply none are needed. | Empty state now says no sourced checklist is available, warns that this does not mean there are no agency requirements, and links to service/source leads. No requirements were invented. | Checklist-rendering test checks the explicit unavailable message and services link. |

## Data, policy, and human-review boundaries

- The health-card checklist is based on a **January 2026** city announcement.
  It is historical, time-sensitive, and still unverified. Current requirements,
  venue, schedule, fee, eligibility, and application procedure need City Health
  Office/City Treasurer confirmation.
- The data model has no verified prerequisite relationships for these
  requirements. The UI must not imply an official sequence.
- No item has been promoted to `verified`; the independent two-person review
  process remains mandatory.
- No Makati content was copied. Davao data gaps remain blocked until local
  authoritative evidence and review policy exist.
- Filipino and Cebuano additions are draft translations and need native-speaker
  review.
- Public reports, civic-map submissions, location collection, and live feeds
  remain outside this repository's approved public architecture.
