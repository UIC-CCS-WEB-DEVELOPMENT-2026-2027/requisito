# Static data usage (#32)

The exact schema is in [data-contract.md](data-contract.md).
Arrays are named exports: goals, requirements, documents.
Pages import the four functions from src/data/helpers.js, never the arrays.

- getGoals(): one First Job goal, numeric ID 1, stepsCount 6.
- getRequirementsByGoal(1): six requirements. Unknown IDs return [].
- getDocuments(): four fictional document tracker entries.
- getSummaryCounts(): { goals: 1, requirementsDone: 0, documentsExpiring: 1 }.

All requirement sources are empty and statuses unverified. Dates, quantities,
and document statuses are samples for human verification. No real ID numbers
or personal documents are stored. Helpers return fresh records.

## Suggested issue comment

Week 2 data uses the contract in docs/data-contract.md. Import getGoals,
getRequirementsByGoal, getDocuments, and getSummaryCounts from
src/data/helpers.js. Use numeric goal ID 1 for First Job (6 requirements,
4 document examples). Samples are unverified; source links are empty and dates
are fixtures. See docs/static-data-usage.md. Teammate review remains pending.
