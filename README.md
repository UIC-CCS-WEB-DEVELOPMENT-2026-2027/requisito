# Requisito

Requisito is an independent student paperwork-pathfinder prototype. It demonstrates goal-based document checklists, dependency ordering, and a sample document tracker.

**Live app:** [requisito.vercel.app](https://requisito.vercel.app)

## Problem

People preparing for a first job or another document-based goal may struggle to identify the required paperwork and the order to obtain it. Missing a prerequisite can mean repeating a visit or delaying an application.

## Solution

Users choose a predefined goal and review an ordered sample checklist. First Job includes an employer-clearance question that updates the sample plan. React, Vite, and React Router provide a responsive static frontend with no backend, accounts, or AI service.

All requirements, dependencies, quantities, dates, and document statuses are illustrative and must be checked against official sources. Progress and tracker values are static examples, not real personal records. The live deployment may lag behind local development until redeployed.

## MVP Features

- Home dashboard with summary cards powered by shared data helpers.
- Goal cards with First Job first; other goals are placeholders until researched.
- First Job requirements ordered by Bruce's plan generator through a numeric-ID adapter.
- An employer-clearance question that filters the generated plan.
- Requirement cards with sample verification dates; empty source links stay hidden.
- Four fictional document tracker entries showing valid or expiring status.
- Demo sign-in with in-memory access to Goals, Checklist, and Documents; refresh signs out. This is not real authentication.
- Shared footer, government-affiliation disclaimer, and responsive navigation.
- Home, Goals, Checklist, Documents, and not-found routes; the legacy Questions route redirects to Checklist.
- React Router refresh support through Vercel rewrites.

## Team Members and Roles

| Member | Role | Responsibilities |
| --- | --- | --- |
| Szianzey Asesor | Frontend | Build the React screens, shared components, routing, and responsive layouts. |
| Bruce Arevalo | Systems Analyst | Define the problem, user requirements, goal flows, and acceptance criteria. |
| Jefferson Laspinas | QA | Check the user flow, validation, navigation, mobile layout, and production behavior; report and retest defects. |
| Caleb | PM & Backend | Coordinate sprint work, track scope and deadlines, prepare team deliverables, and plan backend work for future phases. |

## 4-Week Sprint Timeline

Proposed timeline; calendar dates will be confirmed by the team.

| Week | Focus | Deliverables and acceptance checks |
| --- | --- | --- |
| 1 | Discovery and planning | Agree on the problem, target users, MVP scope, roles, wireframes, and backlog. |
| 2 | Frontend foundation | Build the shared layout, navigation, goal selection, and question flow; verify selection validation and responsive screens. |
| 3 | Complete the MVP | Connect the questionnaire to the checklist, completion tracking, review, and reset actions; test the complete user flow. |
| 4 | QA, release, and presentation | Resolve defects, pass the production build, deploy, verify direct route refreshes, finalize documentation, and prepare the pitch and AI usage disclosure. |

## How to Run

Install Node.js and npm, then open a terminal in the repository folder:

```sh
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

If PowerShell blocks `npm.ps1`, use `npm.cmd install` and `npm.cmd run dev` instead.

To check the production build:

```sh
npm run build
```

## Demo sign-in

Open `/login` and use made-up input: a well-formed email and at least eight
password characters. No real account exists and no credentials are saved or sent
to a server. Successful sign-in opens Home; then use the navigation to explore.
See [the mock-auth contract](docs/data-contract.md#auth-mock-front-end-only).

## Deployment

The current app is deployed directly through Vercel CLI. Automatic deployments from GitHub are not connected. `vercel.json` rewrites client-side routes to `index.html` so direct links and page refreshes load the app.

<!--
Redeploy to Vercel from this repository in PowerShell:
1. Commit or preserve any local work before switching branches or pulling.
2. git checkout main
3. git pull --ff-only
4. npm.cmd ci
5. npm.cmd run build
6. npx.cmd vercel login (only when not signed in)
7. npx.cmd vercel --prod
Use the existing requisito project in the intended personal Vercel account.
Build command: npm run build; output directory: dist; framework: Vite.
After deployment, open https://requisito.vercel.app and refresh /goals,
/questions, and /checklist. Routes that require a selected goal may redirect
to /goals after refresh because app state is held in memory.
Update the live URL in this README if it changes. Commit and push repository
changes only with the team's approval.
-->

## Phase 2 Pitch

Phase 2 proposes login, saved plans, a document tracker, and an admin console backed by a relational database and authenticated server API. Shared requirements stay separate from each user's completion progress.

See the [database design draft](docs/database-design.md) for tables, key fields, relationships, an entity diagram, and open decisions. The proposal includes the six required tables plus supporting saved-plan tables. The documentation draft is complete; teammate review was waived at the project owner's request. No backend is implemented.

## AI Usage Disclosure

Reserved for the team's reviewed disclosure of AI tools used during development, the work they supported, and how the team checked their output. Codex assisted with this README, deployment configuration, Week 2 static UI/data, tests, database design draft, and adaptation of Bruce's generator. Automated checks and browser checks were run; the team should confirm the complete record before submission.
