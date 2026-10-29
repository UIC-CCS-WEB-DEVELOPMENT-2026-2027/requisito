# BetterSolano feature-port report

## Summary

Requisito remains a Davao-focused React + Vite + React Router paperwork
pathfinder. The local BetterSolano source was inspected; the static source tree
is the fuller feature reference, while the React/Next app is comparatively
small. Solano civic datasets were not copied, and no existing Davao record was
promoted to verified.

The feature effort adds safe, small improvements to existing Requisito
surfaces. It does **not** deliver full BetterSolano feature parity. Features
requiring verified Davao datasets, external authorization, or real browser
validation remain partial or blocked; see [FEATURE_GAP.md](./FEATURE_GAP.md).

## Changes delivered

- Added native catalog-based autocomplete to the home and search-page inputs.
- Added client-side filtering to the source-linked legislation/archive index.
  The page remains explicitly a limited index, not a complete ordinance
  database.
- Added a mobile hotline marquee that pauses on hover/focus and respects
  reduced-motion preferences. Existing verified-only eligibility remains.
- Added Open Graph/canonical metadata, website/search structured data, a
  `robots.txt` file, and a build-generated XML sitemap from the public route
  manifest. Error/status routes are excluded from crawler listings.
- Added localized `/403` and `/500` React pages.
- Added a Leaflet map to the existing `/live` route, centered on the existing
  approximate Davao weather model point. It uses OpenStreetMap tiles and the
  existing Open-Meteo fetch, credits both providers, and retains link-based
  fallbacks if weather, map code, or map tiles cannot load.
- Added two accessible SVG charts on `/statistics`, derived only from existing
  `cityFacts.json` and `barangays.json` values. Every plotted figure is marked
  unverified and has an official PSA source link. Barangay bars are explicitly
  described as Requisito catalog-entry counts, not official population or
  district totals.
- Added official directory links to the City resolutions archive / 21st City
  Council page and the DPWH projects portal. No new ordinance, resolution, or
  DPWH project records were added.
- Retained the existing versioned service worker, offline page, update checks,
  Requisito flows, and BetterSolano attribution/license notice.
- Added tests for the feature contracts and updated the feature inventory,
  decisions, and data-source documentation.

## Feature status and blockers

| Area | Status |
| --- | --- |
| Services and details | Partial: existing directory and 17 records; details and applicability need official review; no claim of the source's full catalog. |
| Officials/departments | Partial: existing directory; officeholders and full roster not established. |
| Budget/fiscal transparency | Partial: three unverified allocations; not an audited or project-spending dataset. |
| DPWH projects | Partial: added official DPWH projects portal and City transparency links; the DPWH page reviewed did not expose a Davao-specific project listing, so no project records were added. |
| Legislation | Partial: linked the official City Council page and resolutions archive; no new record was added because the fetched resolution entry had a malformed document URL and the council page is not a legislative corpus. |
| Statistics/charts | Partial: charts now use existing city facts and barangay data; every value is unverified, PSA-cited, and qualified. Economic/competitiveness datasets remain unavailable. |
| Search | Implemented for the local catalog; suggestions are not a full-site source index. |
| News/editor/social feed | Partial: public updates and admin update-record management exist; no distinct editor or authorized Davao social feed. |
| Weather, currency, time | Partial: live information now includes the Leaflet/OpenStreetMap map at the existing Open-Meteo point, attribution, and failure fallbacks. Browser network/tile behavior remains unverified. |
| Hotline ticker | Partial: behavior implemented; verified-only policy means it may be hidden until eligible hotline records are reviewed. |
| Appointment integration | **Blocked:** `https://davaocity.gov.ph/appointments/` and `/appointment/` returned 404. City-site appointment search returned news articles, not a booking system. No appointment link/integration was added. |
| Quiz | Existing Requisito quiz retained; not a port of Solano quiz content. |
| History timeline | Partial: route exists; no source-backed Davao history records loaded. |
| Localization | English, Filipino, and Cebuano catalogs have key parity; native-speaker review remains. |
| PWA | Existing install/offline/update functionality and generated worker retained; browser behavior pending. |
| Accessibility | Existing shared accessibility patterns retained; no WCAG certification claim; browser keyboard/mobile-menu validation pending. |
| SEO | Metadata, robots, generated sitemap, structured data implemented; deployed host/crawler behavior pending. |
| Legal/help/error pages | Existing pages retained; `/403` and `/500` added. Host-level error routing not established. |
| Tooling | Existing Vite, lint, test, MVP gate, and Playwright setup retained; no version bump/Lighthouse workflow added. |

## Data TODOs and verification

The current data audit reports **257/257 structurally valid records, 257
unverified, and 0 validation errors**. Six of 12 feature-catalog arrays are
empty. The audit checks structure and policy, not factual accuracy.

Known unverified catalog values include:

- 17 service/hotline records: service requirements, procedures, fees,
  applicability, and contact details require source review.
- 182 barangay names and district assignments: still unverified; population
  fields are null.
- Three office records: no verified holder names; department-head coverage is
  incomplete.
- Three 2026 budget allocations: unverified and not independently audited.
- Seven city facts, five updates, three civic briefs, and 36 requirement
  records: remain unverified.
- Procurement/project and history datasets are empty. No complete Davao
  ordinance/resolution corpus or verified demographics/economy/competitiveness
  series was loaded.
- Existing records with absent source URLs, dates, fees, contacts, or other
  nullable details remain incomplete. See the individual JSON records and
  [data/SOURCES.md](./data/SOURCES.md); do not infer missing values.

No sample, placeholder, guessed, or Solano record was represented as verified.
Record-level source/retrieval limitations are documented in
[data/SOURCES.md](./data/SOURCES.md).

## Decisions and source handling

- Keep Requisito's Vite/React stack and adapt feature logic rather than copying
  the vanilla-JS source or migrating frameworks.
- Retain English, Filipino, and Cebuano; translation review remains necessary.
- Preserve the unofficial-information and non-government-approval notices.
- Added Leaflet for the requested OpenStreetMap map. No other dependency, Git
  branch, or commit was added.
- Treat the BetterSolano source data as Solano reference material, not Davao
  evidence. The source clone is documented in [DECISIONS.md](./DECISIONS.md).

## Verification

**Passed:** `npm run check:mvp` completed with exit code 0 after these additions:
201 network-independent tests passed, with 0 failures; lint, link/accessibility
audit, build, and the MVP readiness audit passed. Data audit reports 257
structurally valid records, 257 unverified, and 0 validation errors. The audit
reports `MVP_READY`, alongside `PRODUCTION_VERIFICATION_PENDING` and
`governmentVerificationGate: BLOCKED`; MVP readiness is for demonstration and
controlled testing only, not government verification or public-release
approval. The build-generated sitemap includes the existing `/live` and
`/statistics` routes, and the production bundle includes Leaflet assets.

**Playwright blocked:** The desktop and mobile projects have new E2E tests for
weather failure fallback/provider attribution, statistics figures/sources,
City Council and DPWH source links, and the appointment limitation. The
requested commands were not rerun because this sandbox previously denied the
Playwright web server's bind to `127.0.0.1:4173` with `listen EPERM`. The same
path is blocked, and I did not retry or bypass that sandbox restriction. Thus
there are no browser E2E pass counts; the new tests still need execution in an
environment that permits the configured local server.

## Manual checks for a permitted environment

```sh
npm install
npm run dev
npm run check:mvp
npx playwright test --project=desktop-chromium
npx playwright test --project=mobile-chromium
```

In the browser, check the routes listed in the app sitemap; test search and
language switching; exercise the checklist and refresh persistence; check
mobile navigation, keyboard focus, reduced motion, offline fallback, PWA
install/update prompts, and `/403` and `/500`. Confirm external official links
and deployed sitemap/canonical metadata before release.
