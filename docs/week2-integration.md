# Week 2 integration audit

This file records the pre-release audit. Final deployment and board verification
evidence is recorded on release issues #20 and #35 after production QA.

## Scope and provenance

This integration retains teammate commits without rewriting history:

| PR | Contribution | GitHub state at audit |
| --- | --- | --- |
| #40 | Shared Footer and DisclaimerBanner | Merged |
| #41 | Szianzey's Home summary and goal grid | Merged |
| #42 | Bruce's standalone plan-generator preview | Merged |
| #43 | Szianzey's GoalCard steps count | Merged |
| #44 | Szianzey's RequirementCard, StatusBadge, DocumentCard, date formatting, responsive layout | Merged |

PR #58 merged the mock-auth UI and integration fixes. A follow-up applies the
project owner's selected purple single-card sign-in design, replacing the teal
split layout while retaining that earlier version in Git history.
Legacy PR #15 (Bruce-Jeff Navbar/Button work) remains open and is outside the
Week 2 integration scope. No open Szianzey Week 2 PR remained at audit time.

## Integration fixes

- Retain Szianzey's component/date-formatting and responsive improvements.
- Use natural card height inside the numbered generated list to prevent a card
  from extending into the next step label on phone screens.
- Restore helper-driven Checklist and Documents data instead of page-local
  placeholder arrays; preserve the exact shared data contract.
- Retain Bruce's ordered planner through the existing React helper adapter.
- Keep five goals, with actual sample step counts: First Job 6, other goals 0.
  Placeholder goals show an explicit empty state instead of the First Job plan.
- Retain the demo sign-in, login-page navigation behavior, Footer, and disclaimer.
- Remove the accidental my-folder gitlink without deleting local files or
  rewriting its original commits. Keep the standalone prototype as source history.
- Configure ESLint for the standalone prototype's classic script globals,
  leaving the React module rules intact.

## Issue-to-PR evidence

| Issue | Evidence / remaining action |
| --- | --- |
| #19, #34 Footer/disclaimer | PR #40 |
| #21 Home summary | PR #41 |
| #24 Goals | PRs #41, #43 |
| #26, #27 Requirements/status badge | PR #44; shared-data/planner wiring retained by this integration |
| #28 Documents | PR #44; shared-data wiring retained by this integration |
| #22, #25 Responsive work | PR #44 plus integrated browser checks |
| #9 Generator | PR #42 plus React adapter tests |
| #17, #18, #32, #33 | Earlier main commits contain deployment, README, static data, and database draft; merged PR #58 records the integration and retained implementation |
| #20, #35 Integration/release | Requires merged integration PR, successful live deployment, phone QA, and board verification |
| #29 Responsive follow-up | Do not infer completion just from the branch name; link confirmed PR evidence and test results |
| #30, #31, #36, #37, #38, #39 | Remain open; this release does not claim missing specs, research, test-plan documents, or teammate QA were completed |

An issue being closed is not proof of its project-board status or a merged PR.
Do not mark an incomplete card Done. This file is an evidence aid, not a
substitute for checking the actual board through approved GitHub access.

## Validation and release

- Nine planner/adapter regression tests pass.
- Production build and lint pass after the integration fixes.
- No conflict markers remain.
- Integrated local browser checks pass at 360px, 768px, and 1280px: Home,
  Goals, generated Checklist, Documents, login navigation, answer filtering,
  card/step overlap, tap targets, and shared Footer/DisclaimerBanner.
- Live-production phone checks remain pending deployment.
- Production URL: https://requisito.vercel.app
- Teammate source content remains sample/unverified. No real personal documents
  or government ID numbers are included.

GitHub CLI is authorized for the Requisito Kanban board (organization project
16). Cards #13 and #14 were found Done while legacy PR #15 remained open and
were returned to review. PR #58 is confirmed merged. Final release evidence and
board reconciliation will be recorded on #20/#35; pending release checks in
this pre-release snapshot must not be read as completed checks.
