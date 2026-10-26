# Data contract

Last updated: 2026-10-23. Keep source verification distinct from checklist
progress and from document-status examples.

## Requisito records

New civic records in `services.json`, `barangays.json`, `officials.json`,
`cityFacts.json`, `updates.json`, `history.json`, `budget.json`,
`procurement.json`, `briefs.json`, `elections.json`, and
`accountability.json` share these fields when records are present:

| Field | Type |
| --- | --- |
| id | string or number; unique within its data file |
| slug | string; unique within its data file and used in routes |
| type | `service`, `hotline`, `barangay`, `official`, `fact`, `update`, `requirement`, `history`, `budget`, `procurement`, `brief`, `election`, or `accountability` |
| title | string |
| description | string |
| category | string |
| sourceUrl | HTTPS source URL or empty string when none is supplied |
| lastVerified | `YYYY-MM-DD` or `null` |
| verification | `verified`, `unverified`, or `conflicting` |
| timeSensitive | boolean |
| notes | string |

Service and hotline records also have `contact: { phone: string[], email:
string, address: string, hours: string }`; `steps` and `relatedSources` are
optional. Barangays have `adminDistrict`, `legislativeDistrict`,
`population2020` (a non-negative integer or `null` when unavailable), and
`isSample` (`false` for the imported real list). Barangay slugs are unique
lowercase URL-safe names derived by folding accents and replacing punctuation
or whitespace with hyphens; collisions receive a numeric suffix. Officials have `holderName`, which stays
`null` until independently verified. Updates may have a nullable `date`.
Requirement and document records may have `validityMonths: number | null`.

History records add `year: number | null`; a null year displays as
"Date to be confirmed." Budget records add `fiscalYear`, `sector`, and
non-negative `amountPHP`. Procurement records add `referenceNo`, `agency`,
non-negative `amountPHP`, nullable `awardDate`, and the source-provided `status`.
Briefs add ordered `steps` and a `whatYouNeed` list; related source links are
optional. Officials may add `term`; holder and term are displayed only when the
record is verified. Election records contain only sourced links and summaries.
Accountability records use `kind` = `audit-report`, `ordinance`, `resolution`,
or `public-statement`, plus `officialBody`, `referenceNo`, and `date`; the
catalog starts empty.

`featureCatalogs.json` is a separate, explicitly empty collection for the
Part 6 route families: `reports`, `events`, `assets`, `publicRecords`,
`mapLocations`, `transitRoutes`, `heritageSites`, `tourismPlaces`, `cinemas`,
`communityTools`, `estateListings`, and `civicAuditEntries`. Each collection
must remain an array. A future row must have the shared civic fields above and
its feature-specific fields documented and audited before use. The current
arrays are all empty because no reviewed source records were supplied; do not
fill them with plausible examples. `scripts/audit-data.mjs` checks the twelve
arrays and requires the shared fields on any later rows.

Budget and procurement JSON catalogs start empty and are generated from
maintainer-provided CSVs. Imported rows are unverified, never sample-filled.
The source-watch list is separate (`data/watchlist.json`); state hashes and the
last report date are in `data/source-watch-state.json`. Neither source watch
nor an importer changes verification dates.

Goals list stable `requirementIds`; those links are authoritative. A
requirement is defined once and may be linked by multiple goals. Its existing
`goalId` remains the primary-goal field used by the local admin and assistant
adapters. Requirements add `requirementType` (`mandatory`, `conditional`, or
`recommended`), `sourceIds`, `revision`, optional `when` applicability rules,
localized condition labels, and `guideInstructions`. `copies` may be `null`
when an exact quantity is not supported. `verification` is independent of
checklist progress; checklist statuses are saved separately in the browser.

`requirementSources.json` stores source IDs, official agency/title/URL,
publication or statement dates when known, `lastChecked`, supported claims,
verification state, and limitations. A source URL or fetch date is not
approval. Source records and linked requirements remain unverified until the
existing two-person review process approves them.

`lastChecked` is `null` when the source itself has not been checked directly.
If an unverified record relies on a research handoff that reports when its
author checked the source, retain that separate date and the report's page
references in `researchAttribution`; do not copy the reported date into
`lastChecked`. The data audit requires this provenance for source records that
have no direct check date.

Document guides are derived from the same requirement definitions and their
stable slugs. `documents.json` and the former sample document-tracker records
are removed; `/documents` is a searchable guide catalog, not personal
document storage. No uploads or account/device synchronization are implemented.

## Helpers

`src/data/helpers.js` returns copies for the directory functions:

- `getServices()`, `getServiceBySlug(slug)`,
  `getServicesByCategory(category)`
- `getBarangays()`, `getBarangayBySlug(slug)`, `getDistricts()`
- `getOfficials()`, `getCityFacts()`, and `getUpdates()`
- `getHistory()`, `getBudget()`, `getProcurement()`, `getBriefs()`,
  `getElections()`, and `getAccountability()`
- `getFeatureRecords(name)` returns a defensive copy of a Part 6 feature
  catalog; unknown catalog names throw rather than silently returning no data.
- `getVerifiedGuides(category)` and `filterVerifiedGuides(records, category)`
  expose only briefs that are marked verified, have non-empty titles and
  descriptions, an HTTPS source, a steps array, and a needs array. The current
  guide finder correctly returns an empty result because no supplied brief is
  verified.
- `getDistricts()`, `getDistrictSummary()`, and
  `getBarangaysByDistrict(name)` expose administrative-district pages and
  profiles without changing the source barangay records.
- `getRecordCounts()` returns per-catalog counts and their shared total. The
  Home total and data audit use the civic catalogs plus requirements.
- `getGoalBySlug()`, `getRequirementsByGoal()`, and `getChecklistPlan()` resolve
  one goal into the shared requirement definitions and active conditional
  checklist steps. `getDocumentGuideBySlug()` derives guide-to-goal links from
  the same IDs; `getRequirementSources()` returns source metadata copies.
- `getDocuments()` derives searchable document guides from guide-enabled
  requirements rather than a duplicate document catalog.
- `searchAll(query)` returns grouped arrays for services, barangays,
  requirements, updates, history, briefs, budget, procurement, elections,
  accountability, and districts. It folds accents, ranks title matches, and
  excludes sample or placeholder rows. `/search` stores its query and selected
  type in the URL.
- `/barangays` stores its search, district filters, and sort settings in URL
  parameters; filtered CSV export includes only visible real barangays.
- `getStatusReport()` derives verification counts, stale records,
  time-sensitive records, and known gaps. `STALE_DAYS` is 90.
- `getCityMonitor()` derives monitor values from those local records, while
  `getSourceWatchStatus()` exposes the last local report date and result counts.

Goal ID 1 is first-job readiness and references six employer-dependent
preparation entries plus the same eight Davao health-card requirements used by
goal ID 7. Davao-specific entries are included only for Davao work; unanswered
conditions remain visible. Goal ID 7 is the Davao health-card context and
assumes Davao work while asking about its two occupation-specific conditions.
Its City source is a January 2026 announcement: six items are listed generally
in that announcement, and two are conditional (food-safety seminar certificate
and Hepatitis B antibody test for the described pink-card work). It reports
chest x-ray (6 months), urinalysis (3 months), and fecalysis (3 months)
validity periods. These are historical source statements, not current
confirmation of requirements, fees, venue, schedule, accepted formats, or
prerequisite order. Source and requirement records remain unverified.

The PhilHealth formal-members page checked 2026-10-25 supports only the
direct-contributor eligibility category described in its source metadata; it
does not establish a first-job registration checklist. First-job entries with
no source are recommendations or employer prompts, not universal rules.
Passport, NBI, LTO, civil registry, SSS, Pag-IBIG, BIR, scholarship, and
education requirements remain incomplete until current official sources are
reviewed.

## Verification rules and fixtures

All civic seed records start unverified with `lastVerified: null`. A source URL
does not mean that its claims have been verified. The local admin workflow
requires one reviewer or admin to submit a verification request after checking
the official page; a different reviewer or admin must approve it. Requests
include the source URL, date accessed, and a note describing the exact fields
compared. Approval records the request's source URL and a real, nonfuture
`lastVerified` date in the local database. Verified sources must use HTTPS on
the server's exact official-host allowlist; verified catalog records must also
pass the data audit's `.gov.ph` or `OFFICIAL_DOMAIN_ALLOWLIST` rule. Verified
text must not contain sample, placeholder, or fictional markers. Any non-empty
fact `sourceUrl` must be an HTTPS URL. The audit is read-only.

Editing record data resets a verified record to unverified and clears its
verification date. It also cancels pending requests for that record, because
their comparison notes no longer describe the current data. Both operations
are written to the append-only audit log. The local database is separate from
the checked-in JSON catalogs; only the explicit `npm run db:export` command
copies validated records into those catalogs. Do not manually change a record
to `verified` in JSON.

The 182 imported barangay names and district assignments were compiled from a
secondary list and remain unverified until checked against the PSA workbook and
the city's official district list. Their populations remain `null` until
matched to the PSA 2020 table. Barangay audit checks record count, unique names
and slugs, expected district totals, and legislative-district assignments.

Any future sample budget or procurement rows must be clearly named and marked
`isSample: true`; sample records are excluded from search, status counts, and
City Monitor. The current budget, procurement, history, and accountability
catalogs are empty. The elections catalog contains only the unverified COMELEC
official-site link. History entries must be supplied with dates and sources.

The six general first-job preparation entries have no supporting official
source in the catalog and remain unverified. Their guidance asks users to
confirm employer-specific requests rather than presenting them as mandatory.

## Language and privacy

The interface offers English, Filipino, and Bisaya (Cebuano) labels. Record
content remains English. Filipino and Bisaya translations need native-speaker
review. New navigation and Part 2 page labels are included in all three
catalogs; missing translations fall back to English. Language preference is
stored in local storage when the browser permits.

Demo sign-in is only in-memory UI state. The correction form captures no name or
email, does not call a server, and prepares a public GitHub issue link. Do not
put personal or sensitive information in a correction.

## Existing mock-auth contract

The auth provider exposes `isSignedIn`, `signIn(email)`, and `signOut()`.
Passwords are validated by the form, cleared after every submit attempt, and
never passed to auth context. The state resets on refresh. Goals, Checklist,
and Documents remain protected; civic information routes are public.

Signed-out visitors to a protected route are sent to `/login` with the original
location in router state, replacing the protected-route history entry.
Successful demo sign-in returns them to the originally requested location with
replace; if there was no requested location (such as a direct `/login` visit),
it sends them to Home (`/`) with replace. Signed-in visitors who open `/login`
are redirected to Home (`/`) with replace. The UI notice says:
"Demo sign-in: no real authentication yet. Full login arrives in Phase 2."

## Local admin authentication contract

The separate `/admin` application uses the local Express API and SQLite
database. It has no public sign-up, seeded account, or default credentials.
The first admin account is created interactively with `npm run admin:create`;
later account creation requires an active admin. Passwords use salted scrypt
hashes and are never stored or returned in plaintext. Sessions use random
HttpOnly, SameSite cookies; only keyed session-token hashes are stored.

Every state-changing API request requires the configured same-origin `Origin`
and `X-Requested-With: portal-admin` header. Roles are viewer (read-only),
reviewer (edit and submit/decide reviews), and admin (review plus user
management and full audit-log access). The API listens only on loopback for
local development. The admin database is not automatically exported or
deployed with the public site.
