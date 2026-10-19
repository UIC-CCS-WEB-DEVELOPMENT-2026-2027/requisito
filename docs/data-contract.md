# Week 2 shared data contract

Issue #32 was read before implementation. It names the four helpers but does not
specify conflicting field names or statuses. This contract follows the Week 2
sprint instructions and supersedes the earlier draft usage note.

| Record | Exact fields and types |
| --- | --- |
| Goal | id: number, title: string, description: string, stepsCount: number |
| Requirement | id: number, goalId: number, label: string, notes: string, copies: number, sourceUrl: string, lastVerified: YYYY-MM-DD string, status: unverified or done |
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
