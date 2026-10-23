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

Budget and procurement JSON catalogs start empty and are generated from
maintainer-provided CSVs. Imported rows are unverified, never sample-filled.
The source-watch list is separate (`data/watchlist.json`); state hashes and the
last report date are in `data/source-watch-state.json`. Neither source watch
nor an importer changes verification dates.

The existing requirement fields remain: `id`, `goalId`, `label`, `notes`,
`copies`, `sourceUrl`, `lastVerified`, `status`, and `verification`. They now
also carry the shared civic metadata and `validityMonths`. Checklist `status`
tracks progress; `verification` tracks source review.

Existing document tracker records retain their display fields `id`, `type`,
`issueDate`, and `status`; `validityMonths` is null until a freshness window is
confirmed. The fictional tracker examples do not calculate expiry.

## Helpers

`src/data/helpers.js` returns copies for the directory functions:

- `getServices()`, `getServiceBySlug(slug)`,
  `getServicesByCategory(category)`
- `getBarangays()`, `getBarangayBySlug(slug)`, `getDistricts()`
- `getOfficials()`, `getCityFacts()`, and `getUpdates()`
- `getHistory()`, `getBudget()`, `getProcurement()`, `getBriefs()`,
  `getElections()`, and `getAccountability()`
- `getDistricts()`, `getDistrictSummary()`, and
  `getBarangaysByDistrict(name)` expose administrative-district pages and
  profiles without changing the source barangay records.
- `getRecordCounts()` returns per-catalog counts and their shared total. The
  Home total and data audit use the civic catalogs plus requirements; the four
  illustrative document-tracker examples are intentionally outside that count.
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

Existing goal, requirement, document, summary, planning-question, and checklist
helpers remain available. Goal ID 7 is "First Job in Davao City" and has seven
illustrative health-card requirements; only chest x-ray (6 months), urinalysis
(3 months), and fecalysis (3 months) have supplied validity periods.

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

The first six requirements and four document tracker entries remain
illustrative. Some legacy requirement fixtures have a sample date in
`lastVerified`, but their `verification: "unverified"` state is authoritative;
the interface reports them as never verified.

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
