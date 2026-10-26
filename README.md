# Requisito

Requisito is an independent student project presenting Davao City civic
information in a paperwork-pathfinder interface. It is **not an official
website of the City Government of Davao** and is not affiliated with BetterGov
or BetterLGU.

**Existing live app:** [requisito.vercel.app](https://requisito.vercel.app).
The Davao civic portal changes in this branch have not been deployed.

The public project uses the existing React + Vite + React Router + plain CSS
stack. A separate, local-only Express API and SQLite database support the
restricted admin workspace; there is no public account service or
server-side contribution endpoint. Public directory content comes from JSON
catalogs in `src/data`.

## Tier 1 features in this prototype

- Searchable city services and hotlines, with contact links and service details.
- Barangay directory and profiles with 182 names and district assignments from
  a secondary list. Populations are blank; the list still needs checking against
  PSA and city sources and remains unverified.
- City facts, a source-linked notices feed, and an offices-only officials page.
- Global search across goals, services, real barangay records, requirements,
  official source records, and updates.
- Source-linked civic briefs, a sourced history timeline, election links, and
  office profiles that show holders only after verification.
- Budget and procurement dashboards with CSV importers; catalogs remain empty
  until official source data is supplied.
- A local-data City Monitor, source-watch report, empty accountability ledger,
  source-aware participation guidance, and integrity disclosures.
- Sources and Status page with derived verification counts, review-age reporting,
  time-sensitive records, and known gaps.
- A correction form that prepares a public GitHub issue; it does not submit or
  save content on a Requisito server.
- English, Filipino, and Bisaya interface labels. Filipino and Bisaya strings
  need native-speaker review.
- A connected goals → requirements → checklist → document-guide flow uses
  shared requirement IDs, source metadata, conditional applicability, and
  browser-local checklist progress. Current evidence is limited and remains
  unverified pending the existing two-person review. The
  [requirements research queue](docs/requirements-research-queue.md) lists the
  next high-priority source checks.
- Each currently listed public goal has a checklist. Passport, NBI Clearance,
  driver's license, and SSS/PhilHealth include explicit `demoOnly` planning
  prompts with localized questions and guides. These prompts are unverified,
  non-mandatory demonstrations—not policy evidence—and do not satisfy the
  separate First Job verification gate.
- A loopback-only admin workspace supports record editing, two-person source
  verification, user roles, and an append-only audit trail.

## Additional civic routes

Part 2 adds `/history`, `/budget`, `/procurement`, `/briefs`, `/monitor`,
`/officials/:slug`, `/elections`, `/accountability`, `/participate`, and
`/integrity`. The remaining reference features and any data-dependent omissions
are documented in [docs/parity-matrix.md](docs/parity-matrix.md) and
[docs/parity-final.md](docs/parity-final.md). The broader
accountability, participation, election, monitor, and integrity pages remain
static prototypes: there is no public reporting system or live source feed.
The local admin API does not change that public-site boundary. See the existing
[database design draft](docs/database-design.md) before designing any public
backend.

## Part 6 route and data states

Public routes are registered in `src/routeManifest.js`; header and footer
navigation use that manifest, and the shared `href()` helper generates internal
URLs. Run `npm run audit:links` to check JSX destinations and accessible
controls, or `npm run check` to include that audit, the Node tests, and the
production build.

The `/service-guides` and `/where-to-go` pages expose only complete briefs
whose source review is already marked verified. The current supplied briefs
are unverified, so those finders intentionally show no verified results.
Data-dependent routes such as `/map`, `/reports`, `/calendar`, `/assets`,
`/mobility`, `/heritage`, and `/tourism` have usable empty states rather than
invented Davao records. Their explicit arrays are in
`src/data/featureCatalogs.json` and currently remain empty.

`/help`, `/contact`, `/privacy`, and `/terms` are linked from the footer.
Contact links are source leads, not confirmed details; the contact action
remains disabled until an official address is configured. Privacy and terms
copy is clearly marked as a draft. See [docs/parity-final.md](docs/parity-final.md)
for the route-to-data map and [docs/link-audit.md](docs/link-audit.md) for the
automated checks and their limits.

## Run locally

```sh
npm install
npm run db:import
npm run admin:create
```

Set `SESSION_SECRET` in your ignored `.env` file to a unique random value of at
least 32 characters before starting the API. Do not use the placeholder in
`.env.example`. Start the API and frontend in separate terminals:

```sh
npm run api:dev
npm run dev
```

Use the local URL printed by Vite. The API listens only on loopback and the
Vite development server proxies `/api`. `npm run db:import` adds current JSON
catalog rows without overwriting existing database records. `npm run
admin:create` prompts for the initial admin account without echoing the
password. See the [admin runbook](docs/admin-runbook.md) before using the local
admin workspace. Run the validation suite with:

```sh
npm run check
```

`npm run check` runs the read-only data audit, route/link audit, complete Node
test suite, and production build.
`npm run lint` is also available.

Browser end-to-end tests cover the main first-job flow on desktop and mobile.
Install the Chromium browser once, then run:

```sh
npx playwright install chromium
npm run test:e2e
```

Playwright starts Vite on loopback at `127.0.0.1:4173`; server integration
tests also bind an ephemeral loopback port. Run both in a local or CI
environment that permits local sockets. See the
[release checklist](docs/release-checklist.md) for blocked checks, commands,
and government-source review status.

## Public guidance and demo sign-in

Goals, goal details, checklist planning, document guides, and public search are
available without signing in. Checklist answers and item progress are stored
in the current browser profile only; they are not synced to an account or
server. The `/login` page is a front-end demo flow, not a real account system.
It does not authenticate users for the separately protected admin workspace.
See the
[mock-auth contract](docs/data-contract.md#existing-mock-auth-contract).

## Data and source verification

All civic seed records are `unverified` with `lastVerified: null`. A source
link is a lead for human review, not proof that the record is accurate or
current. In the local admin workspace, one reviewer submits a sourced request
and a different reviewer or admin must approve it. Approval records the
official source URL and a real, nonfuture verification date. Editing a record
resets verification and cancels any pending review for that record. These
changes stay in the local database until `npm run db:export` validates and
explicitly writes them to the JSON catalogs. The audit itself is read-only.
See [docs/data-contract.md](docs/data-contract.md#verification-rules-and-fixtures)
and the [admin runbook](docs/admin-runbook.md).

Contact numbers, office hours, fees, health-card requirements, and schedules
can change. Confirm them with the issuing city office before acting. The
barangay names and district assignments are an unverified secondary-source
compilation, and populations are still unavailable. The health-card catalog
reflects only a dated January 2026 City announcement and does not establish
current requirements. Several high-priority national services remain
unresearched. See the [requirements flow and maintenance guide](docs/requirements-flow.md).

### Refresh the barangay directory

The current barangay names and district assignments were compiled from a
secondary list and are not verified. Check them against PSA and city sources;
populations remain blank until matched from the official workbook. The CSV at
`data-source/davao-barangays.csv` uses exactly these headers:

```text
name,adminDistrict,legislativeDistrict,population2020,sourceUrl
```

Then run:

```sh
node scripts/import-barangays.mjs
npm run check
```

The import writes unverified records. It does not mark data as verified. To
merge populations after obtaining the official PSA workbook, save the City of
Davao sheet as `data-source/psa-davao-population.csv` and first run
`node scripts/merge-population.mjs` for a dry-run report. Review all matches
before using `--write`. See [docs/data-refresh.md](docs/data-refresh.md).

### Budget and procurement data

Place official source CSVs at `data-source/davao-budget.csv` and
`data-source/davao-procurement.csv`. Run `node scripts/import-budget.mjs` and
`node scripts/import-procurement.mjs`, then `npm run check`. See
[docs/data-refresh.md](docs/data-refresh.md) for exact column names. The current
catalogs are empty; no sample money or contracts are included.

### Source watch

Preview the approved source list without a network request using
`node scripts/source-watch.mjs --dry-run`. Run `node scripts/source-watch.mjs`
only when ready to fetch the official pages. Review the report and verify
changes manually; source-watch never changes record verification metadata.

## Limitations

- Most factual content is unverified. Empty source links and null dates are
  intentionally visible rather than filled with guesses.
- Barangay names and district assignments still need official-source review;
  population values are not yet available.
- History, budget, procurement, and accountability records need data from the
  maintainer; imported civic and financial data remains unverified.
- Participation instructions without an approved source explicitly say so.
- Part 6 feature catalogs for reports, events, assets, transit, heritage,
  tourism, and related records are empty until reviewed source data is supplied.
- The new contact route has no configured official contact address, so its
  action is disabled. Existing source links are unverified leads.
- Privacy and terms routes contain draft disclosures and have not received
  legal review.
- The contribution form only prepares a GitHub issue link. Submitting is a
  separate action on GitHub and requires a repository account.
- Public demo sign-in is front-end-only and is not a security boundary; it is
  separate from `/admin` authentication.
- The admin API and database are local-development tools, not a deployed
  production service. Do not expose the API to the Internet or place secrets
  in frontend environment variables.
- The assistant answers only from eligible verified records in normal mode.
  New history, brief, and budget records are included only after they meet the
  verified-source checks. Provider configuration and keys stay on the server.
- The development server and browser route checks were not started by this
  automation run; use the manual route list supplied with the completion
  report to check refresh behavior and the 360px layout.

## Deployment

The public app is deployed through Vercel CLI; automatic deployments from
GitHub are not connected. `vercel.json` pins the Vite build/output and rewrites
deep links to the SPA entry point, while `/api/chat` is routed to the
server-side function in `api/chat.js`. `.vercelignore` excludes local
environment files, SQLite data, and the internal Express/SQLite admin server;
only the function under `api/` is deployed as an API. The local admin API is
not deployed. A production admin service would need a separately reviewed
hosting design with persistent protected storage, TLS, same-origin routing,
backups, and operational controls; this local SQLite setup is not that
service. No deployment was made for these changes.

## AI assistant development

The public app is deployed through Vercel. The assistant calls the Vercel
server-side function at `/api/chat`, which adapts the existing shared assistant
handler; Gemini credentials remain on the server. For local frontend-plus-
function testing, run `npx vercel dev --listen 3000` (plain `npm run dev` does
not serve this function). Run `npm run ai:diagnose` to check configuration
presence and model-name format without contacting Gemini or printing secrets.
That format check does not prove model availability. Configure `AI_PROVIDER`,
`AI_MODEL`, and `AI_API_KEYS` privately in the ignored `.env` file or Vercel
server-side project settings. The
unverified-record override is local-test-only and must never be enabled in a
deployed context. The assistant is also available in an accessible header
dialog; page context is resolved on the server and is still subject to verified
record rules. No live provider call is made by automated tests or the default
evaluation plan. See [docs/ai-assistant.md](docs/ai-assistant.md) for request
flow, safeguards, tests, evaluation, and deployment instructions.

## Credits

This project was informed by BetterMakati and the Better Local Gov starter kit.
Their citizen-first directory, content, source transparency, search, and
contribution patterns were independently reimplemented in Requisito's stack.
No BetterMakati source code, branding, images, or Makati-specific content was
copied. See [docs/credits.md](docs/credits.md).

## Future work

The current accountability ledger, participation guidance, elections links,
monitor, and integrity pages are static prototypes. Any future public database
or authenticated API requires separately reviewed data ownership,
authentication, retention, privacy, moderation, and operational policies. The
existing database design is only a draft and must be reviewed before extending
the local admin service into a public backend.

## AI Usage Disclosure

This civic portal was built by Caleb with AI assistance. AI helped implement
the user-requested code, tests, and documentation. Caleb remains responsible
for review, official-source verification, manual browser testing, and release
decisions.

- Caleb's independently written or revised code: [FILL IN].
- Caleb's completed official-source checks and manual route testing: [FILL IN].

Automated tests and builds do not verify that government information is
factually correct.
