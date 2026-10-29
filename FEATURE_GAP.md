# BetterSolano feature comparison

**Scope:** Compare the local BetterSolano reference with Requisito’s existing
React + Vite + React Router implementation. The statuses describe the feature
coverage in this project, not the accuracy or completeness of its civic data.
No Solano civic records were copied into Davao catalogs.

| BetterSolano feature | Requisito status | Existing or added surface | Remaining gap / blocker |
| --- | --- | --- | --- |
| Services directory, categories, and detail pages | Partial | Davao services directory and service-detail routes with 17 records | Not a complete source-equivalent category set or 22 verified service details. Records still need official-source review. |
| Officials and department heads | Partial | Officials directory/profile routes | Three office records; names and complete department-head roster are not established. |
| Budget and fiscal transparency | Partial | Searchable-by-year budget allocations and official source directory | Three unverified 2026 allocations; no audited fiscal datasets, historical series, or spending-level data. |
| DPWH projects | Partial | Procurement page now links the official DPWH projects portal and City transparency reports | DPWH page reviewed did not expose a Davao-specific project listing; no project records were added. |
| Ordinances and resolutions search | Partial | Legislation page filters the locally indexed leads and links the official resolutions archive and 21st City Council page | No complete legislative corpus; the City Council page is a committee-information page, and one fetched resolution listing had a malformed document link. No new ordinance/resolution record was added. |
| Statistics, demographics, economy, competitive index, charts | Partial | Statistics page now renders SVG charts from existing city facts and barangay catalog data, with unverified labels and per-figure PSA citations | Figures remain unverified, the barangay chart counts catalog entries rather than official population/administrative totals, and no verified economic or competitiveness series exists. |
| Site-wide search with autocomplete | Has it | Search route and home search use native suggestions from Requisito’s local service/goal catalog | Suggestions cover only the local catalog; no source-wide index. |
| News and admin news editor | Partial | Public updates page; authenticated admin record-management surface supports update records | No distinct news-editor workflow or verified social-feed/sync integration. Do not add a Facebook feed without a Davao-owned source and authorization. |
| Weather map (Leaflet/Open-Meteo) | Partial | `/live` now includes a Leaflet/OpenStreetMap map at the existing Davao model point, uses the existing Open-Meteo fetch, and shows map/weather fallbacks and provider attribution; unit and Playwright coverage added | Playwright execution remains blocked by the earlier sandbox `listen EPERM` on its required loopback server; live tile/network behavior remains unverified. |
| Currency and Philippine time | Has it | Live information panel includes currency reference and Philippine clock | External data freshness and browser/network behavior were not browser-tested. |
| Emergency hotline marquee | Partial | Verified-only hotline ticker with pause on hover/focus and reduced-motion support | Existing Davao hotline records are not verified, so the ticker can remain hidden until records pass review. |
| Appointment services integration | Blocked | Official City site paths `/appointments/` and `/appointment/` returned 404; the City's appointment search result was news coverage, not a booking service | No official Davao City appointment page/integration was found; do not link to an unsupported booking service. |
| Quiz | Has it | Requisito quiz route | Existing Requisito quiz; not a port of Solano-specific quiz data. |
| Brief history timeline | Partial | History route | History catalog is empty pending dated official or otherwise acceptable source evidence. |
| English, Filipino, Cebuano/Bisaya switcher | Has it | Three locale catalogs and language switcher | Cebuano/Filipino translations need native-speaker review. |
| PWA install, update, and offline | Has it | Manifest, install affordance, Vite-generated versioned service worker, offline page, update checks | Static/unit contracts pass; install/update/offline behavior not verified in a real browser. |
| Accessibility | Partial | Shared layout, accessible labels/landmarks, skip navigation and accessibility information | No WCAG conformance claim; keyboard/mobile-menu focus behavior needs real-browser verification. |
| SEO: Open Graph, sitemap, robots, structured data | Partial | Open Graph/canonical metadata, build-generated sitemap, robots file, website/search structured data | Generated artifacts pass build assertions; deployed canonical host and live crawler behavior depend on deployment configuration. |
| Privacy, terms, contact, FAQ, and error pages | Partial | Existing privacy/terms/help/contact surfaces, not-found page; added `/403` and `/500` | No server-specific error routing; page render checks pass but end-to-end response behavior is host-dependent. |
| Build and quality tooling | Partial | Vite build, lint, test suite, MVP gate, and Playwright configuration; new desktop/mobile E2E cases added for the requested features | No version-bump or Lighthouse workflow. Playwright browser runs are blocked here by sandbox `listen EPERM`. |

## Reference inspection

The local `./bettersolano` clone is present. The static repository root contains
the broader feature reference; `react-app/` is a much smaller Next.js
implementation. Requisito’s own Vite/React conventions remain the target.
Upstream civic JSON records are Solano-specific, and observed source files
include placeholder/draft content, so they are not Davao data sources and were
not imported.

## Data integrity and verification status

The current data audit reports 257 structurally valid records, all marked
unverified. Structural validity is not factual verification. Current gaps
include service/fee/procedure details, officeholders, barangay/district
assignments, city facts and population values, budget allocations, updates,
requirements, project data, legislation, history, and statistical series.
See [data/SOURCES.md](./data/SOURCES.md) for dataset-level provenance and
[REPORT.md](./REPORT.md) for the current record counts, known TODOs, checks, and
browser-testing limitation. No record was promoted to verified in this work.
