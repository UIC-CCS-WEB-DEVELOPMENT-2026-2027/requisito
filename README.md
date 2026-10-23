# Requisito

Requisito is an independent student project presenting Davao City civic
information in a paperwork-pathfinder interface. It is **not an official
website of the City Government of Davao** and is not affiliated with BetterGov
or BetterLGU.

**Existing live app:** [requisito.vercel.app](https://requisito.vercel.app).
The Davao civic portal changes in this branch have not been deployed.

The project uses the existing React + Vite + React Router + plain CSS stack.
There is no database, account backend, or server-side contribution endpoint.
Directory content comes from JSON catalogs in `src/data`.

## Tier 1 features in this prototype

- Searchable city services and hotlines, with contact links and service details.
- Barangay directory and profiles. Until an official CSV is supplied, the six
  visible records are explicitly fictional sample rows, excluded from search
  and status counts.
- City facts, a source-linked notices feed, and an offices-only officials page.
- Global search across services, real barangay records, requirements, and updates.
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
- The existing goals, checklist, documents, demo sign-in, and AI assistant remain.

## Additional civic routes

Part 2 adds `/history`, `/budget`, `/procurement`, `/briefs`, `/monitor`,
`/officials/:slug`, `/elections`, `/accountability`, `/participate`, and
`/integrity`. The remaining reference features and any data-dependent omissions
are documented in [docs/parity-matrix.md](docs/parity-matrix.md). The broader
accountability, participation, election, monitor, and integrity features are
still a Phase 2 prototype: there is no backend, database, user-submitted
reporting system, or live source feed. See the existing
[database design draft](docs/database-design.md) before any future backend work.

## Run locally

```sh
npm install
npm run dev
```

Use the local URL printed by Vite. No new runtime dependencies were added.
Run the validation suite with:

```sh
npm run check
```

`npm run check` runs the read-only data audit, all Node tests, then the
production build. `npm run lint` is also available.

## Demo sign-in

Open `/login` and enter a well-formed email and a password of at least eight
characters. No real account exists; credentials are not saved or sent to a
server. Successful sign-in opens Home unless a protected page redirected you
to sign in, in which case it returns you to that page. Goals, Checklist, and
Documents require the in-memory demo sign-in. See the
[mock-auth contract](docs/data-contract.md#existing-mock-auth-contract).

## Data and source verification

All civic seed records are `unverified` with `lastVerified: null`. A source
link is a lead for human review, not proof that the record is accurate or
current. Only Caleb may change a record to `verified`, after checking the
official page and entering a real, nonfuture verification date. Verified links
must use HTTPS on a `.gov.ph` host or a host Caleb explicitly adds to
`OFFICIAL_DOMAIN_ALLOWLIST`. The audit reports problems and never edits data.

Contact numbers, office hours, fees, health-card requirements, and schedules
can change. Confirm them with the issuing city office before acting. The
provided barangay rows are fictional UI fixtures, not city records. Requirements
and document examples also remain illustrative and unverified.

### Refresh the barangay directory

Obtain the barangay names, administrative and legislative districts, 2020
population, and source URLs from PSA PSGC and the 2020 Census tables. Put the
CSV at `data-source/davao-barangays.csv` with exactly these headers:

```text
name,adminDistrict,legislativeDistrict,population2020,sourceUrl
```

Then run:

```sh
node scripts/import-barangays.mjs
npm run check
```

The import writes unverified records. It does not mark data as verified.
Additional update steps are in [docs/data-refresh.md](docs/data-refresh.md).

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
- Barangays are not yet populated from official source data.
- History, budget, procurement, and accountability records need data from the
  maintainer; imported civic and financial data remains unverified.
- Participation instructions without an approved source explicitly say so.
- The contribution form only prepares a GitHub issue link. Submitting is a
  separate action on GitHub and requires a repository account.
- Demo sign-in is front-end-only and is not a security boundary.
- The assistant answers only from eligible verified records in normal mode.
  New history, brief, and budget records are included only after they meet the
  verified-source checks. Provider configuration and keys stay on the server.
- The development server and browser route checks were not started by this
  automation run; use the manual route list supplied with the completion
  report to check refresh behavior and the 360px layout.

## Deployment

The existing app is deployed through Vercel CLI; automatic deployments from
GitHub are not connected. `vercel.json` rewrites client-side routes to
`index.html` for direct links and refreshes. No deployment was made for these
changes.

## AI assistant development

The assistant calls a Netlify Function, so `npm run dev` serves only the
frontend. For local function testing, use `npx netlify-cli dev` and configure
`AI_PROVIDER`, `AI_MODEL`, and `AI_API_KEYS` in the ignored `.env` file. The
unverified-record override is local-test-only and must never be enabled in a
deployed context. See [docs/ai-assistant.md](docs/ai-assistant.md) for the
request flow, safeguards, tests, evaluation, and deployment instructions.

## Credits

This project was informed by BetterMakati and the Better Local Gov starter kit.
Their citizen-first directory, content, source transparency, search, and
contribution patterns were independently reimplemented in Requisito's stack.
No BetterMakati source code, branding, images, or Makati-specific content was
copied. See [docs/credits.md](docs/credits.md).

## Future work

The current accountability ledger, participation guidance, elections links,
monitor, and integrity pages are static prototypes. Any future database or
authenticated API requires reviewed data ownership, authentication, retention,
privacy, moderation, and operational policies. The existing database design is
only a draft and must be reviewed before implementation.

## AI Usage Disclosure

This civic portal was built by Caleb with AI assistance. AI helped implement
the user-requested code, tests, and documentation. Caleb remains responsible
for review, official-source verification, manual browser testing, and release
decisions.

- Caleb's independently written or revised code: [FILL IN].
- Caleb's completed official-source checks and manual route testing: [FILL IN].

Automated tests and builds do not verify that government information is
factually correct.
