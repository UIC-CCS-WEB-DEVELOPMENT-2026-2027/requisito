# Requisito

Requisito is an independent student paperwork-pathfinder prototype. It demonstrates goal-based document checklists, dependency ordering, and a sample document tracker.

**Live app:** [requisito.vercel.app](https://requisito.vercel.app)

## Problem

People preparing for a first job or another document-based goal may struggle to identify the required paperwork and the order to obtain it. Missing a prerequisite can mean repeating a visit or delaying an application.

## Solution

Users choose a predefined goal and review a sample checklist. React, Vite, and React Router provide the frontend, with demo sign-in rather than real accounts. The AI assistant feature adds a Netlify Function that answers from eligible catalog records; no database is implemented.

All requirements, dependencies, quantities, dates, and document statuses are illustrative and must be checked against official sources. Checklist progress exists only in memory, and tracker values are fictional. The AI feature has not been deployed to the existing live URL.

## MVP Features

- Home dashboard with summary cards powered by shared data helpers.
- Goal cards with First Job first; other goals are placeholders until researched.
- First Job requirements ordered by the existing plan generator through a numeric-ID adapter.
- An employer-clearance question that filters the generated plan.
- Requirement cards with sample verification dates; empty source links stay hidden.
- Four fictional document tracker entries showing valid or expiring status.
- Demo sign-in with in-memory access to Goals, Checklist, and Documents; refresh signs out. This is not real authentication.
- Shared footer, government-affiliation disclaimer, and responsive navigation.
- Home, Goals, Checklist, Documents, and not-found routes; the legacy Questions route redirects to Checklist.
- React Router refresh support through Vercel rewrites.

## Feature owner

The AI assistant feature was built by Caleb with AI assistance. Caleb owns
implementation, source verification, testing, and release decisions for this feature.
Existing application code remains the baseline; this statement does not reassign
historical authorship of that code.

## 4-Week Sprint Timeline

Proposed timeline; calendar dates will be confirmed by Caleb.

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
If you were redirected to sign in from a protected page, successful sign-in
returns you to that page instead.
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
changes only with Caleb's approval.
-->

## Phase 2 Pitch

Phase 2 proposes login, saved plans, a document tracker, and an admin console backed by a relational database and authenticated server API. Shared requirements stay separate from each user's completion progress.

See the [database design draft](docs/database-design.md) for tables, key fields, relationships, an entity diagram, and open decisions. The proposal includes the six required tables plus supporting saved-plan tables. The database design is a draft for Caleb to review; no database is implemented.

## AI Assistant

The feature was built by Caleb with AI assistance. The Checklist includes a chat
that calls a Netlify Function; provider keys stay on the server. Answers use only
eligible catalog records, and the server supplies source links, dates, and warnings.
All six current requirements remain unverified. Normal mode refuses guidance
until Caleb checks records against official sources.

Run `npx netlify-cli dev` (usually `http://localhost:8888`). Plain `npm run dev`
serves only the frontend. Configure `AI_PROVIDER`, `AI_MODEL`, and `AI_API_KEYS`
in the ignored `.env`; no default model is selected. Missing configuration returns
a generic unavailable response.

**Local-only test warning:** `ALLOW_UNVERIFIED_FOR_TESTING=true` can be set in the
ignored `.env` to exercise fictional records. It works only when Netlify CLI sets
`NETLIFY_DEV=true`, with no deployed context. Never configure this flag on a
hosted site or use it to claim accuracy. Responses are capped at `partial` and
include "TEST MODE: unverified placeholder data". Do not set `NETLIFY_DEV` yourself.

Checks:

```sh
node scripts/audit-data.mjs
node --test scripts/chat.test.mjs scripts/eval-assistant.test.mjs
node scripts/eval-assistant.mjs
```

The live evaluation requires the local Netlify server and a selected model.
It generates answerable cases only from verified records, delays 13 seconds after
provider calls, and reports skipped cases prominently. The current catalog has
zero verified records, so all eight answerable cases are skipped.

See [AI assistant documentation](docs/ai-assistant.md) for the data flow, local
tests, source updates, configuration, limitations, and manual deployment steps.

## AI Usage Disclosure

The AI assistant feature was built by Caleb with AI assistance. Codex assisted
with secret hygiene, the verification field, the read-only audit, model probes,
server validation and failover, React chat components, evaluation scripts,
automated tests, and documentation. Existing project code was used as the baseline.
Caleb makes the model choice and verifies official requirement sources.

- Caleb's independently written or revised code: [FILL IN].
- Caleb's completed browser tests and official-source checks: [FILL IN].

Automated test results are recorded during development. They do not establish
that model answers are factually correct. Live model and browser checks must be
reported separately; AI assistance does not count as source verification.
