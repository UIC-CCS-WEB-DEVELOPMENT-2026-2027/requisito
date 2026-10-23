# BetterMakati parity matrix

Part 2 maps the reference project's public pages and operational features to
Requisito's Davao-specific implementation. Reference paths are identification
only; no reference code, branding, or Makati content is copied.

| BetterMakati feature / reference file | Requisito implementation | Status |
| --- | --- | --- |
| Home (`src/pages/Home.tsx`) | `src/pages/Home.jsx` | Done in Part 1 |
| Services (`src/pages/Services.tsx`) | `src/pages/Services.jsx`, `src/data/services.json` | Done in Part 1 |
| Service guides (`src/pages/ServiceGuide.tsx`) | `src/pages/Briefs.jsx`, `src/data/briefs.json` | Done in Part 2; only supplied source-based briefs |
| Hotlines (`src/pages/Hotlines.tsx`) | `src/pages/Services.jsx`, hotline records in `src/data/services.json` | Done in Part 1 |
| Barangays (`src/pages/Barangays.tsx`) | `src/pages/Barangays.jsx`, `src/data/barangays.json` | Done in Part 1 |
| Barangay profiles (`src/pages/BarangayProfile.tsx`) | `src/pages/BarangayProfile.jsx` | Done in Part 1 |
| History (`src/pages/History.tsx`) | `src/pages/History.jsx`, `src/data/history.json` | Done in Part 2; empty until dated sourced entries are supplied |
| Not found (`src/pages/NotFound.tsx`) | `src/pages/NotFound.jsx` | Done in Part 1 |
| About (`src/pages/About.tsx`) | `src/pages/AboutDavao.jsx`, `src/data/cityFacts.json` | Done in Part 1 |
| News and updates (`src/pages/News.tsx`) | `src/pages/Updates.jsx`, `src/data/updates.json` | Done in Part 1 |
| Today/current city information (`src/pages/Today.tsx`) | `/status` and `/monitor` | Done in Part 2; computed from local records only |
| Government offices (`src/pages/GovernmentOffices.tsx`) | `src/pages/Officials.jsx` | Done in Part 1 |
| Official profiles (`src/pages/OfficialProfile.tsx`) | `src/pages/OfficialProfile.jsx` | Done in Part 2; holder and term shown only after verification |
| Search (`src/pages/Search.tsx`) | `src/pages/Search.jsx`, `searchAll` | Done in Part 1 and extended in Part 2 |
| Project status (`src/pages/ProjectStatus.tsx`) | `src/pages/Status.jsx` | Done in Part 1 and extended in Part 2 |
| Civic contribution form (`src/components/civic/CivicContributionForm.tsx`) | `src/pages/Contribute.jsx` | Done in Part 1 |
| Civic briefs (`src/pages/CivicBriefs.tsx`) | `src/pages/Briefs.jsx`, `src/data/briefs.json` | Done in Part 2; only the three supplied briefs |
| Source freshness (`scripts/check-sources.mjs`) | `scripts/source-watch.mjs`, `data/watchlist.json` | Done in Part 2; network execution remains a manual step |
| Source freshness workflow (`.github/workflows/source-freshness.yml`) | `.github/workflows/source-watch.yml` | Done in Part 2; workflow was not run |
| Budget dashboard (`src/pages/ProjectsBudget.tsx`) | `src/pages/Budget.jsx`, `scripts/import-budget.mjs` | Done in Part 2; empty until official CSV is supplied |
| City monitor (`src/pages/CityMonitor.tsx`) | `src/pages/Monitor.jsx`, `getCityMonitor` | Done in Part 2; no scraping, feeds, or official scoring |
| City monitor record detail (`src/pages/CityMonitorRecordPage.tsx`) | Reused status cards and record metadata | Skipped: one-off record drill-down adds no supported data; source and verification are shown inline |
| Elections (`src/pages/Elections.tsx`) | `src/pages/Elections.jsx`, `src/data/elections.json` | Done in Part 2; COMELEC link only, unverified |
| Accountability (`src/pages/Accountability.tsx`) | `src/pages/Accountability.jsx`, `src/data/accountability.json` | Done in Part 2; empty until sourced official documents are provided |
| Participation (`src/pages/Participate.tsx`) | `src/pages/Participate.jsx` | Done in Part 2; unsupported source-dependent actions say source to be added |
| Integrity (`src/pages/Integrity.tsx`) | `src/pages/Integrity.jsx` | Done in Part 2; coverage counts are live |
| Public records (`src/pages/PublicRecords.tsx`, `src/pages/PublicRecordDetail.tsx`) | Accountability ledger schema and page | Skipped as a broad public-record archive: no Davao records were supplied; the ledger accepts only the four specified official document kinds |
| Legislation (`src/pages/Legislation.tsx`) | Accountability ledger schema | Skipped as a separate archive: no sourced Davao ordinances or resolutions were supplied |
| Civic audit pilot/results (`src/pages/CivicAuditPilot.tsx`, `src/pages/CivicAuditResults.tsx`) | None | Skipped: requires collecting and publishing observations about public bodies, with no approved Davao data or review policy |
| Civic reports (`src/pages/CivicReports.tsx`, `src/pages/ReportArticle.tsx`, `src/pages/Reports.tsx`) | Correction form only | Skipped: no reports or publishable Davao case records supplied; no allegations or private individuals will be invented |
| Civic map (`src/pages/CivicMap.tsx`) | None | Skipped: no verified geospatial dataset supplied |
| Nearby reports (`src/pages/CivicNearbyReport.tsx`) | None | Skipped: location collection and reporting need privacy, moderation, and backend policies outside this prototype |
| Civic assets (`src/pages/CivicAsset.tsx`) | None | Skipped: no sourced asset inventory supplied |
| Calendar (`src/pages/Calendar.tsx`) | Time-sensitive announcements remain on `/updates` | Skipped as a separate calendar: no complete, verified Davao event schedule supplied |
| Community tools (`src/pages/CommunityTools.tsx`) | None | Skipped: no approved Davao tool dataset supplied |
| Concern finder (`src/pages/ConcernFinder.tsx`) | `/search` | Skipped as a separate guided classifier: no reviewed decision rules supplied |
| Contact (`src/pages/Contact.tsx`) | Hotline and service directory | Skipped as a duplicate page; source-backed contact records are already available |
| Document lookup (`src/pages/Document.tsx`) | Existing `/documents` mock tracker | Skipped as a new public lookup: no official public document search source supplied |
| Get involved (`src/pages/GetInvolved.tsx`) | `/participate` | Done in Part 2 through source-based participation guidance |
| Government directory (`src/pages/Government.tsx`) | `/officials` and `/services` | Skipped as a duplicate combined directory; the distinct office and service records have dedicated pages |
| Heritage (`src/pages/Heritage.tsx`) | None | Skipped: no Davao heritage seed records supplied |
| Mobility (`src/pages/Mobility.tsx`) | None | Skipped: no verified transit or mobility dataset supplied |
| Open government (`src/pages/OpenGovernment.tsx`) | `/integrity`, `/status`, `/accountability` | Done in Part 2 to the extent supported by the specified local records |
| Privacy and terms (`src/pages/Privacy.tsx`, `src/pages/Terms.tsx`) | Existing privacy notices and project disclosures | Skipped as standalone legal pages: this prototype has no account or data-submission backend; no legal policy text was supplied |
| Statistics (`src/pages/Statistics.tsx`) | `/monitor` | Skipped as a separate statistics page; current derived counts are shown in status and monitor |
| Visit Makati (`src/pages/VisitMakati.tsx`) | None | Skipped: Davao tourism content was not part of the supplied seed data |
| Cinemas (`src/pages/Cinemas.tsx`) | None | Skipped: no Davao venue dataset supplied |
| Estates (`src/pages/Estates.tsx`) | None | Skipped: Makati-specific content has no Davao equivalent in the supplied data |
| Live city feed (`src/pages/LiveMakati.tsx`) | Local `/monitor` only | Skipped: no scraping, live news feed, or social-media source is allowed |
| BetterMakati editorial guides (`CONTENT-GUIDE.md`, `CONTENT-MANAGEMENT.md`) | `docs/data-contract.md`, `docs/data-refresh.md`, `docs/davao-data-sources.md` | Done in Part 1 and Part 2; adapted as project-specific guidance |
| Source watch and update workflow (`.github/workflows/*`) | Source-watch script and manual-review PR workflow | Done in Part 2; automation is not run or pushed by this task |
| API-backed civic reporting (`api/civic*.js`, `api/community-input.js`) | No backend; `/contribute` prepares a GitHub issue | Skipped: project constraint prohibits adding a backend, database, authentication, or contribution endpoint |
| External news/places APIs (`api/news.js`, `api/places.js`) | Static source-linked catalogs | Skipped: external API calls and unsupported live data are outside this static prototype |

## Completion notes

- Part 2 pages with missing official datasets intentionally show empty states or
  unverified source records rather than invented facts.
- Budget and procurement importer outputs start empty; no sample financial or
  contract values are fabricated.
- Source watch is tested using local fixtures and was only run with `--dry-run`.
- The BetterMakati checkout remains read-only. Requisito reimplements patterns
  with its existing React, router, CSS, and data conventions.
