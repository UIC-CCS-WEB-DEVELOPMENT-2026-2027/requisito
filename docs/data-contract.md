# Week 2 shared data contract

Last updated: 2026-10-22 — separate requirement verification from checklist progress.

Issue #32 was read before implementation. It names the four helpers but does not
specify conflicting field names or statuses. This contract follows the Week 2
sprint instructions and supersedes the earlier draft usage note.

| Record | Exact fields and types |
| --- | --- |
| Goal | id: number, title: string, description: string, stepsCount: number |
| Requirement | id: number, goalId: number, label: string, notes: string, copies: number, sourceUrl: string, lastVerified: YYYY-MM-DD string, status: unverified or done, verification: verified or unverified or conflicting |
| Document | id: number, type: string, issueDate: YYYY-MM-DD string, status: valid or expiring |

`sourceUrl` is an empty string until verified. Do not add or rename fields.
Record IDs are internal numeric keys, never real identification numbers.

## Helpers (src/data/helpers.js)

- getGoals() -> Goal[]
- getRequirementsByGoal(goalId: number) -> Requirement[]; no match returns [].
- getDocuments() -> Document[]
- getSummaryCounts() -> { goals: number, requirementsDone: number, documentsExpiring: number }

Pages obtain data only through these helpers. Components receive data only as
props. Counts use the exact statuses `done` and `expiring`.

## Sample content

Catalog records live in `src/data/goals.json`, `src/data/requirements.json`,
and `src/data/documents.json`. Helpers import these JSON arrays; their exported
function names, parameters, and return shapes are unchanged. JSON contains only
data, so explanations of the fictional records are kept here.

Goal ID 6, "Sample goal (no requirements)", is a visible test fixture on the
Goals page. Its stepsCount is 0 and no requirement references it.
`getRequirementsByGoal(6)` returns `[]` to exercise the Checklist empty state.
The catalog now contains six goals, including the four existing placeholders.

First Job has six sample requirements, each with copies 1, notes "Sample note",
sourceUrl "", lastVerified "2026-10-19", and status "unverified".
Dates are fixture values, not proof of completed verification. Document dates
and valid/expiring statuses are fictional tracker examples, not personal records
or computed expiry results. A human must verify requirements, quantities, dates,
and official sources before these samples are used as real guidance.

## Integration with main

Szianzey's four additional placeholder goals are retained with numeric IDs 2-5
and stepsCount 0. First Job remains ID 1 with all six sample requirements.
Placeholder goals show an empty-state message rather than another goal's plan.

## Auth (mock, front-end only)

This is a UI demo of the Phase 2 login flow, not real authentication or an
authorization boundary. The Login page displays:
"Demo sign-in: no real authentication yet. Full login arrives in Phase 2."

`AuthProvider` wraps the app in `main.jsx`. `useAuth()` must be called inside
that provider and exposes:

- `isSignedIn`: boolean, initially false.
- `signIn(email)`: accepts a well-formed email and sets the demo boolean to true.
  The email is not retained in context. The form checks a minimum of eight
  password characters before calling this function; it never passes the
  password into context.
- `signOut()`: sets the demo boolean to false.

State exists only in React memory. Refreshing signs the user out. No password,
token, or auth state is stored in localStorage or sessionStorage, sent to a
server, or logged. Use made-up input rather than actual account details.
The form clears the password after every submit attempt, including invalid
attempts, and disables submission while its callback is pending.

Home and Login are public. Goals, Checklist, and Documents redirect signed-out
visitors to `/login` through `ProtectedRoute`. Successful demo sign-in navigates
to Home. Footer and DisclaimerBanner remain on every route. The existing
catalog record fields and four data helpers are unchanged.

Build, lint, and existing planner tests pass. Browser checks covered validation,
password visibility, sign-in/sign-out, gated navigation, refresh sign-out, and
360px/768px/1280px layouts in light and dark mode. The interface is illustrative:
any syntactically valid email plus eight or more password characters is accepted.

Real authentication in Phase 2 must add server-side identity verification,
password hashing through a suitable authentication service or server, sessions
or tokens with expiry and logout invalidation, HTTPS, rate limiting, and
server-enforced authorization for every private resource. The demo gate alone
does not provide these capabilities.

## Requirement verification

`status` keeps its existing checklist-progress values (`unverified` or `done`).
`verification` separately records source review: `verified`, `unverified`, or
`conflicting`. All six current fictional requirements have verification
`unverified`. Their content, source URLs, and dates are unchanged.

Only QA may confirm a record from its official page. A verified record needs
an HTTPS source whose hostname ends with `.gov.ph`, a real, nonfuture
verification date, and notes without sample, placeholder, or fictional markers.
The audit reports problems; it never edits data or verifies records itself.
