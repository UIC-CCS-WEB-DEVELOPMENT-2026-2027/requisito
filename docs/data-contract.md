# Data contract

Last updated: 2026-10-23. Keep source verification distinct from checklist
progress and from document-status examples.

## Requisito records

New civic records in `services.json`, `barangays.json`, `officials.json`,
`cityFacts.json`, and `updates.json` share these fields:

| Field | Type |
| --- | --- |
| id | string or number; unique within its data file |
| slug | string; unique within its data file and used in routes |
| type | `service`, `hotline`, `barangay`, `official`, `fact`, `update`, or `requirement` |
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
`population2020`, and `isSample`. Officials have `holderName`, which stays
`null` until independently verified. Updates may have a nullable `date`.
Requirement and document records may have `validityMonths: number | null`.

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
- `searchAll(query)` returns `{ services, barangays, requirements, updates }`.
  It trims and lowercases the query and excludes sample barangays.
- `getStatusReport()` derives verification counts, stale records,
  time-sensitive records, and known gaps. `STALE_DAYS` is 90.

Existing goal, requirement, document, summary, planning-question, and checklist
helpers remain available. Goal ID 7 is "First Job in Davao City" and has seven
illustrative health-card requirements; only chest x-ray (6 months), urinalysis
(3 months), and fecalysis (3 months) have supplied validity periods.

## Verification rules and fixtures

All civic seed records start unverified with `lastVerified: null`. A source URL
does not mean that its claims have been verified. Only Caleb can set
`verification` to `verified` and enter a real, nonfuture `lastVerified` date
after checking the official page. Verified sources must use HTTPS on a `.gov.ph`
hostname or a hostname explicitly configured by Caleb in
`OFFICIAL_DOMAIN_ALLOWLIST`. Verified text must not contain sample, placeholder,
or fictional markers. The audit is read-only.

Barangay placeholder rows are named Sample Barangay A-F, marked `isSample: true`,
and clearly labeled in the interface. They are excluded from global search and
all Sources and Status counts. Do not use them as real city information.

The first six requirements and four document tracker entries remain
illustrative. Some legacy requirement fixtures have a sample date in
`lastVerified`, but their `verification: "unverified"` state is authoritative;
the interface reports them as never verified.

## Language and privacy

The interface offers English, Filipino, and Bisaya (Cebuano) labels. Record
content remains English. Filipino and Bisaya translations need native-speaker
review. Language preference is stored in local storage when the browser permits.

Demo sign-in is only in-memory UI state. The correction form captures no name or
email, does not call a server, and prepares a public GitHub issue link. Do not
put personal or sensitive information in a correction.

## Existing mock-auth contract

The auth provider exposes `isSignedIn`, `signIn(email)`, and `signOut()`.
Passwords are validated by the form, cleared after every submit attempt, and
never passed to auth context. The state resets on refresh. Goals, Checklist,
and Documents remain protected; civic information routes are public.

Signed-out visitors to a protected route are sent to `/login` with the original
location in router state. Successful demo sign-in returns them to that route;
a direct `/login` visit falls back to `/`. Signed-in visitors who open `/login`
are redirected to Home with replace. The UI notice says:
"Demo sign-in: no real authentication yet. Full login arrives in Phase 2."
