# Goals, requirements, checklists, and document guides

## One linked catalog

- `src/data/goals.json` defines public goals, stable URL slugs, categories, the
  intended audience, responsible institution, and `requirementIds`.
- `src/data/requirements.json` is the single canonical list of requirement
  definitions. Its numeric `id` is a stable key; `slug` is the guide URL key.
  The `goalId` field remains the primary-goal field expected by the existing
  admin and assistant record adapters. Goal membership is determined by
  `goals[].requirementIds`, so one requirement can be referenced by multiple
  goals without copying its definition.
- `src/data/requirementSources.json` records source identity, dates, exact
  supported claims, review state, and limitations. Requirements link to source
  IDs. A source link or last-checked date does not make a claim verified.
- Goal details, checklist generation, search results, and document guides all
  resolve these same requirement IDs through `src/data/helpers.js`.
  `/documents` derives its entries from guide-enabled requirement records;
  `/documents/:slug` displays linked goals and their conditions. There is no
  separate user document store or duplicated requirement list.
  `/checklist?goal=<goal-id>` uses that stable goal ID to generate only its plan;
  duplicate references are deduplicated. Each checklist guide link carries the
  goal ID and checklist origin, and the guide offers a direct return link.

## Applicability, ordering, and progress

`requirementType` is `mandatory`, `conditional`, or `recommended`. Conditional
records use `when` maps whose answers are defined in `planningRules.js`;
unanswered conditions stay visible until the applicant answers them. Optional
`goalContextKey` and `conditionKey` explain why an item applies. Do not add a
dependency or imply an application sequence unless an official source
establishes it.

Checklist statuses are `not-started`, `in-progress`, `ready`, and
`not-applicable`. They describe only the applicant's own progress, not agency
acceptance. The browser stores checklist progress under
`requisito.checklist-progress.v1`; it does not synchronize with an account or
another device. Conditional planning answers are stored with the same
goal-specific progress record so refreshes and guide navigation regenerate the
same applicable items. Different goal IDs have isolated answers and statuses.
The checklist readiness assessment separately checks prerequisite completion,
source verification, and planner health. It will not report “Ready to apply”
while any listed guidance is unverified, a prerequisite is incomplete, or the
planner reports unresolved warnings; even a ready result describes preparation
only and does not imply agency acceptance.
Keep IDs stable. If a definition changes in a way that affects existing
progress, increment its `revision`; the checklist preserves the prior status
and asks the user to review the changed guidance. Removed IDs are kept in the
saved data and surfaced as an outdated-list warning.

## Adding or maintaining verified guidance

1. Research the responsible agency's current official page or issuance. Record
   the source title, URL, statement/publication/effective dates when actually
   available, date checked, exact fields supported, and unresolved questions.
2. Add or update a `requirementSources.json` record. Keep its verification
   status `unverified` until the existing separate-reviewer workflow approves
   the evidence; never mark it verified just because a URL loads.
3. Add one requirement definition with a new stable `id` and `slug`, a careful
   applicant-specific `requirementType`, and a `sourceIds` link. For
   unsupported details, say what is unknown instead of inventing a procedure,
   fee, format, address, or time.
4. Add the requirement ID to every applicable goal's `requirementIds`. Keep
   `goalId` equal to its existing primary goal for compatibility with the local
   record adapters.
5. For conditions, define the question and allowed answer values in
   `planningRules.js`, add interface labels in English, Filipino, and Cebuano,
   and check the condition with the catalog audit.
6. Add `guideInstructions` only when they accurately distinguish source-backed
   steps from unknown details. Checklist and guide content must remain the
   same canonical record.
7. Run `node scripts/audit-data.mjs`, the focused requirements-flow tests,
   `npm run lint`, and `npm run build`. Use the local two-person review process
   for official verification; code tests do not verify civic claims.

## Current coverage and evidence limits

- The Davao City health-card entries are linked to the official City
  announcement **“Health card issuance starts January 7”**, checked on
  2026-10-25. It reports requirements, three test-validity periods, a fee,
  occupational conditions, and an issuance venue as announced in January
  2026. The record remains unverified and explicitly does not confirm current
  requirements, fees, provider acceptance, location, schedule, or process.
- The official PhilHealth formal-members page was checked on 2026-10-25. It
  supports only the stated direct-contributor eligibility category for workers
  with employee-employer relationships. It does not establish first-job
  registration steps or a required onboarding document.
- The official SSS “Be an SSS Member” page, checked on 2026-10-25, supports
  first-time online SS Number application (and identifies branch E-Centers),
  the major application information categories, an email continuation link
  valid for five calendar days, optional supporting-document upload, and
  employer reporting with employee coverage effective the first day of
  employment. A separately checked SSS ID list describes identity evidence
  but is not a universal upload checklist. Neither page states an application
  fee or an employer-specific onboarding deadline. The checklist and guide link
  directly to the application and the ID list; the requirement's revision was
  incremented so existing progress is flagged for review. Both source records
  remain `unverified` until the separate reviewer workflow approves them.
- The official PhilHealth formal-economy member page supports the worker
  category for established employee-employer relationships. Its online-services
  page documents member-record/MDR access and employer premium remittance, not
  first-time enrollment instructions, fees, or required documents.
- The Official Gazette article for RA 11261 confirms the Act's title and
  signing date and links an official PDF, but the PDF text was not extracted or
  reviewed. Section details were cross-checked only against Lawphil, a
  non-government transcription; they are not verified by the official page.
  The public checklist now directs users to ask the barangay and issuing agency
  about possible fee waivers without asserting unconfirmed coverage, proof,
  exceptions, or procedure. The source remains unverified.
- The first-job goal links only to its six applicant/employer-facing entries;
  Davao health-card records remain in the separate Davao health-card goal and
  are excluded from First Job because current applicability was not established
  by the dated January 2026 announcement. Birth certificate, TIN, and NBI
  entries are shown only when the employer requests them. The Pag-IBIG entry is
  a preparation recommendation to confirm whether an action applies, not an
  instruction to register or pay. SSS and PhilHealth entries distinguish
  evidence-backed statements from procedures still needing confirmation.
- Pag-IBIG pages presented an access challenge during checking. BIR's official
  registration page and PSA page could not be retrieved due to transport/DNS
  failures. A guessed DOLE page returned 403, and the NBI official portal
  returned only its title. Pag-IBIG returned a browser-check challenge. The
  first-job guides retain these as research gaps and do not state unsupported
  application documents, fees, or filing timelines.
- First-job preparation entries without sources are suggestions or employer-
  dependent prompts, not universal requirements. Passport, NBI, LTO, civil
  registry, SSS, Pag-IBIG, BIR, education, and scholarship processes remain
  incomplete until their current official sources are reviewed.
- The prioritized open questions and access limitations are tracked in the
  [requirements research queue](./requirements-research-queue.md).

## Phase 4 validation record (2026-10-25)

- Focused first-job flow, guide rendering, conditional planning, source
  metadata, progress revision, and localization tests: 24 passed.
- `node --test server/core.test.mjs`: 9 passed, including the independent
  two-person review decision rule.
- `npm run lint`: passed; ESLint emitted a non-fatal Browserslist warning about
  the parent `package.json`.
- `npm run build`: passed; Vite reported the existing large-chunk and
  ineffective dynamic-import warnings.
- `npm run audit:links`: passed; scanned 64 JSX files against 61 public and 7
  admin routes.
- `node scripts/audit-data.mjs`: 219/219 records passed validation with 0
  errors; all 219 civic records remain unverified.
- `npm test`: 128 passed, 9 failed out of 137. Each failing HTTP integration
  test stopped at `listen EPERM` on `127.0.0.1`; no networking workaround was
  attempted.
- `git diff --check`: passed.
- At the Phase 4 checkpoint, before the Phase 5 public-route change, browser
  navigation to `/goals/first-job` redirected to `/login`. This was the
  observed behavior then; the public-versus-admin route policy is documented
  in [security notes](./security-notes.md).
