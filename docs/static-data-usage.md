# Static data usage

The current catalog contracts and helper list are maintained in
[data-contract.md](data-contract.md). Pages should read catalog data through
`src/data/helpers.js`, not import catalog arrays directly.

- `getGoals()` returns seven predefined goals. The original First Job remains
  ID 1; the Davao health-card example is goal ID 7.
- `getRequirementsByGoal(1)` returns the six existing illustrative requirements.
- `getRequirementsByGoal(7)` returns seven unverified health-card entries.
- `getDocuments()` returns four fictional document tracker entries.
- Directory helper functions provide services, the 182 unverified barangay records,
  officials, city facts, updates, history, briefs, budget, procurement,
  elections, accountability, global search, derived status, and City Monitor.
- History, budget, procurement, and accountability catalogs are empty until
  sourced data is supplied. The current election catalog contains one
  unverified COMELEC link; briefs are based only on the supplied Part 1 records.

Barangay population fields are currently null; the supplied names and district
assignments came from a secondary list and remain unverified. The audit checks
the expected count, unique names and slugs, district totals, and district
mapping, but never edits or verifies records. Sample rows in any future
budget/procurement catalog must also be excluded from public search, status, and
City Monitor.

## Suggested issue comment

Use the contracts and helper functions in `src/data/helpers.js`; keep the
existing numeric IDs and the distinction between checklist status and source
verification. Civic seed records begin unverified. A reviewer submits the
official source and comparison note; a different reviewer or admin approves
and sets the verification date in the local admin database. See
[`docs/data-contract.md`](data-contract.md) and
[`docs/data-refresh.md`](data-refresh.md).
