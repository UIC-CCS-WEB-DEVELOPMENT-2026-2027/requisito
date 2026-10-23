# Static data usage

The current catalog contracts and helper list are maintained in
[data-contract.md](data-contract.md). Pages should read catalog data through
`src/data/helpers.js`, not import catalog arrays directly.

- `getGoals()` returns seven predefined goals. The original First Job remains
  ID 1; the Davao health-card example is goal ID 7.
- `getRequirementsByGoal(1)` returns the six existing illustrative requirements.
- `getRequirementsByGoal(7)` returns seven unverified health-card entries.
- `getDocuments()` returns four fictional document tracker entries.
- Directory helper functions provide services, sample barangay fixtures,
  officials, city facts, updates, global search, and derived status reporting.

The six sample barangay records are not real city data and are not included in
search or status. The audit checks schema and source-policy rules but never
edits or verifies records.

## Suggested issue comment

Use the contracts and helper functions in `src/data/helpers.js`; keep the
existing numeric IDs and the distinction between checklist status and source
verification. Civic seed records begin unverified. Only Caleb may confirm an
official source and set the verification date. See
[`docs/data-contract.md`](data-contract.md) and
[`docs/data-refresh.md`](data-refresh.md).
