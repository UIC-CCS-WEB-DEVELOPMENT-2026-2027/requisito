# BetterSolano reference port decisions

- **Target architecture:** Keep Requisito's React + Vite + React Router,
  JavaScript, plain CSS, and static JSON conventions. The source clone's static
  repository root contains the broader feature reference; its React/Next.js
  app is comparatively small. Do not migrate Requisito to Next.js or copy
  vanilla-JS implementations.
- **Source availability:** `./bettersolano` is present and was inspected,
  including its README, migration guide, license, static feature files, and
  React app. The static tree is the feature reference. Solano data and
  placeholder/draft values in source datasets were not imported or treated as
  Davao facts.
- **Languages:** Retain English, Filipino, and Cebuano/Bisaya catalogs. Added
  user-facing strings have parity across all three locales; Filipino and
  Cebuano still need native-speaker review.
- **Disclaimer:** Keep the existing clear disclaimer that Requisito is an
  independent, unofficial Davao City information project and does not perform
  government actions or imply approval.
- **Civic data:** Keep all existing Davao records unverified until the
  repository's evidence/review requirements are met. Do not fabricate or
  promote officials, requirements, fees, budgets, populations, ordinances,
  resolutions, projects, or news.
- **Scope:** Implement small UI/search/SEO/error-page improvements where safe.
  Leave features that require a verified Davao corpus, an authorized external
  integration, or browser confirmation explicitly partial or blocked rather
  than create empty imitations or misleading data.
- **Dependencies:** Leaflet was added only for the specifically
  requested OpenStreetMap display. The OSM attribution/copyright host is
  allowlisted for this map use; it is not used as a civic-data record source.
  No other dependency was added.
- **Statistics:** Build charts only from existing city facts and barangay
  records. Keep all figures marked unverified, exclude facts without official
  HTTPS source links, and clearly label grouped barangay bars as catalog-entry
  counts rather than official population or district totals.
- **Legislation and projects:** Add official-source directory links when pages
  were fetched successfully. Do not add a legislative document record from a
  malformed archive link, and do not invent Davao DPWH projects from a generic
  national projects portal.
- **Appointments:** Mark as blocked because the two checked City appointment
  URL patterns returned 404 and the City-site search yielded news, not an
  appointment service.
- **Git:** No branch or commit was created. Workspace instructions prohibit
  Git operations for this project.
- **Browser testing:** A previous local-server bind attempt was denied with
  `listen EPERM` on `127.0.0.1:4173`; do not bypass the sandbox. Report
  browser-only checks as pending. The new Playwright cases were authored but
  not run because the same loopback bind is already known to be blocked.
