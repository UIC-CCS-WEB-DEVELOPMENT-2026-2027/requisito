# Plan generator React integration

Local integration of the existing PR #42, commit 39986db. The planning algorithm
is retained in src/utils/planGenerator.js with an ES module export and attribution.
No PR merge, branch push, plain-script HTML, or my-folder gitlink is included.

## Data flow

Checklist -> getPlanningQuestions / getChecklistPlan -> catalog + planningRules
-> the existing generatePlan -> ordered view-model steps -> RequirementCard via props.

The Week 2 goal, requirement, and document arrays retain their exact schemas.
The helper converts numeric record IDs to strings for the algorithm, then maps
requirement steps back to numeric IDs and fresh catalog records. A generated
step is a separate view model with order, kind, dependencies, and requirement;
it does not add fields to the shared catalog contract.

planningRules.js holds illustrative dependencies and the employer-clearance
question. An unanswered question includes the conditional step; no excludes it.
All dependency claims remain sample content and require official-source review.
Choice groups are supported by the engine but are not needed in the current
six-record sample. Their options are standalone; option dependencies are not
expanded. Missing references produce warnings. ok indicates absence of cycles,
not data completeness or verified government guidance. The page surfaces warnings
and blocked steps; it must not represent a partial plan as authoritative.

## Verification

Run node --test src/tests/planGenerator.test.js, npm.cmd run lint,
and npm.cmd run build. In /checklist, change the employer answer: no gives five
steps; yes or unanswered gives six. No progress is saved and no backend is used.

The earlier Week 2 checklist was static. This local extension makes ordering
and filtering answer-dependent while keeping the catalog and summary helpers
unchanged. Home summary counts still describe static fixtures, not this filtered
plan or saved user progress. The legacy /questions URL redirects to /checklist.
