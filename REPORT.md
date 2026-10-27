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
| DPWH projects | Blocked: no Davao-specific sourced project dataset loaded. |
| Legislation | Partial: searchable source/archive leads only, not a full ordinance/resolution corpus. |
| Statistics/charts | Partial: facts exist but remain unverified; no validated data series suitable for charts. |
| Search | Implemented for the local catalog; suggestions are not a full-site source index. |
| News/editor/social feed | Partial: public updates and admin update-record management exist; no distinct editor or authorized Davao social feed. |
| Weather, currency, time | Partial: live info surface exists; no weather map, and browser network behavior was not verified. |
| Hotline ticker | Partial: behavior implemented; verified-only policy means it may be hidden until eligible hotline records are reviewed. |
| Appointment integration | Blocked: no verified appointment service/destination established. |
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
- Add no dependencies, Git branch, or commit.
- Treat the BetterSolano source data as Solano reference material, not Davao
  evidence. The source clone is documented in [DECISIONS.md](./DECISIONS.md).

## Verification

**Passed:** `npm run check:mvp` completed with exit code 0 after the latest
error-page changes. It includes the data audit (257 records pass structural
checks; all 257 unverified), link/accessibility audit, lint, 198 passing
network-independent tests, production build, and MVP readiness audit
(`MVP_READY`). The same audit reports `PRODUCTION_VERIFICATION_PENDING` and
`governmentVerificationGate: BLOCKED`; MVP readiness is for demonstration and
controlled testing only, not government verification or public-release
approval. Built output includes `robots.txt`, `sitemap.xml`, and versioned
`sw.js`; the sitemap excludes `/403` and `/500`.

**Not run in this pass:** Playwright end-to-end/browser checks. A prior local
server attempt failed with `listen EPERM` binding `127.0.0.1:4173`; do not
bypass the sandbox. Browser testing therefore remains pending, including
onboarding, desktop/mobile layouts, keyboard navigation, locale switching,
search, checklist persistence, offline/updates, and error-page behavior.

## Manual checks for a permitted environment

```sh
npm install
npm run dev
npm run check:mvp
npm run test:e2e
```

In the browser, check the routes listed in the app sitemap; test search and
language switching; exercise the checklist and refresh persistence; check
mobile navigation, keyboard focus, reduced motion, offline fallback, PWA
install/update prompts, and `/403` and `/500`. Confirm external official links
and deployed sitemap/canonical metadata before release.
