# Requisito — Codex Project Instructions

> **Mission:** Refresh the UI/UX of the existing Requisito civic-services application. This is a focused improvement of the current product, **not a rebuild or a new system**.

## 1. Role and Core Principles

Act as a senior software engineer, UI/UX designer, accessibility reviewer, and quality-focused technical lead. Work carefully within the existing Requisito codebase.

### Non-negotiable principles

1. **Preserve Requisito.** Keep its existing purpose, features, workflows, routes, permissions, validation, business rules, database schema, integrations, and authentication unless a change is explicitly required to fix a verified issue.
2. **Do not rebuild.** Do not scaffold a replacement app, redesign the architecture, or replace working modules just because another approach seems attractive.
3. **K.I.S.S. — Keep It Simple.** Make the smallest clear change that solves the problem. Avoid speculative features, needless abstractions, unnecessary dependencies, and overengineering.
4. **Inspect before editing.** Understand the repository, UI patterns, component structure, styling system, and available tests before choosing an implementation.
5. **Keep the scope focused.** Prioritize visual hierarchy, layout, typography, spacing, color, navigation, responsive behavior, accessibility, and concise content.
6. **Protect real data and behavior.** Do not delete or reset user data, run destructive database commands, weaken security, or remove existing functionality.
7. **Verify, do not assume.** Run the checks supported by the repository and fix regressions introduced by the work.
8. **Do not assume the stack.** Discover the actual frameworks, versions, architecture, and commands from the Requisito repository. Do not import assumptions from unrelated projects.

## 2. Project Discovery — Required Before Implementation

Start by inspecting the current Requisito repository.

- Read applicable `AGENTS.md` files, README/project documentation, package and dependency manifests, configuration, routes, entry points, page/component structure, styles, data models, and available tests.
- Identify the actual frontend and backend frameworks, build tools, styling conventions, component library, and application architecture. Do not upgrade or replace them for this refresh.
- Map the existing user roles, civic-service journeys, forms, dashboards, status indicators, search/filter features, notifications, and administrative tools **only where they already exist**.
- Identify the screens users visit most and the tasks they need to complete.
- Record available test, lint, type-check, and build commands. Run relevant baseline checks where practical.
- Audit the current interface for inconsistent styling, unclear navigation, dense text, confusing forms, poor contrast, responsiveness issues, and redundant information.
- Establish which behavior and data contracts must remain unchanged.
- If the reference website cannot be accessed, continue with the design principles below and clearly state that direct inspection was unavailable.

**Do not begin broad implementation until this discovery pass has identified the affected screens, the observed problems, and the safest minimal approach.**

## 3. Visual Reference — BetterSolano

Reference: https://bettersolano.org/

Use the reference as inspiration for clear, service-oriented information design. Do not copy its content, branding, logo, assets, or exact layout.

Adapt relevant principles to Requisito's civic-services purpose:

- Make the most important service or task easy to identify.
- Use clear page titles, short descriptions, and prominent primary actions.
- Organize services and related actions into scannable sections or cards where useful.
- Make navigation predictable and help users understand where they are and what they can do next.
- Present key information first and secondary information later.
- Use plain language and short, meaningful labels.
- Create a trustworthy, welcoming, professional civic-services experience.
- Make it easy to scan service information, requirements, status, and next steps without overwhelming users.
- Keep the result as an **interactive application**, not a copy of a public-facing reference website.
- Preserve Requisito's identity and existing workflows.

If browsing is available, inspect the reference before implementation and note relevant patterns in hierarchy, navigation, spacing, typography, calls to action, content density, and responsive behavior. Apply only the patterns that fit Requisito.

## 4. UI/UX Design Requirements

### 4.1 Visual consistency

Refine a small, cohesive design system using the project's existing styling conventions.

- Use a restrained, accessible palette with clear text/background contrast, a consistent primary action color, and a limited set of semantic status colors.
- Preserve established Requisito branding where present. If branding is not established, choose a neutral, trustworthy civic-services visual direction and apply it consistently.
- Standardize spacing, alignment, typography, borders, corner radius, shadows, and control sizes.
- Prefer whitespace and clear grouping over heavy borders, excessive shadows, decorative gradients, or clutter.
- Use icons when they improve recognition. Keep style and sizing consistent, and do not replace clear text labels with ambiguous icons.
- Avoid unnecessary animation. Motion should be subtle, purposeful, and respect reduced-motion preferences.

### 4.2 Typography and readability

- Establish a small typography scale for page titles, section headings, body text, labels, metadata, and buttons.
- Use no more than one or two font families unless the existing design already requires otherwise.
- Use readable body text (generally at least 16px where practical), comfortable line height, and clear heading hierarchy.
- Avoid long text lines, cramped labels, tiny low-contrast metadata, and all-caps body text.
- Ensure buttons, links, inputs, table content, alerts, and status labels remain readable at common screen sizes.
- Never use color alone to communicate status, errors, or success.

### 4.3 Shorten and improve interface text

Audit the affected screens for unnecessary reading and reduce text without losing important meaning.

- Replace long introductions with a concise sentence, or remove them if the page heading already explains the purpose.
- Use short, descriptive headings and action-oriented labels.
- Remove duplicated instructions, filler phrases, redundant headings, and information already displayed nearby.
- Convert lengthy explanations into concise helper text or an existing expandable/detail pattern when suitable.
- Use plain, respectful language that is easy for people with different levels of digital literacy to understand.
- Keep service eligibility, required documents, fees, deadlines, legal notices, consent, privacy, appeal rights, and other essential public-service information accurate and complete.
- Never shorten text in a way that changes requirements, eligibility, obligations, deadlines, or the meaning of a civic process.
- Make empty states brief and useful: explain what is missing and provide the next relevant action.
- Make error messages specific and actionable while preserving validation requirements.
- Do not change domain meaning, data values, or public-facing promises without evidence.

### 4.4 Navigation and information architecture

- Make the current location, page purpose, and next available actions obvious.
- Group existing navigation by user task where it improves findability; do not invent new service areas.
- Give each screen one clear primary action and visually quieter secondary actions.
- Make service categories, request/application status, history, and follow-up steps easy to scan where those features already exist.
- Keep search, filters, pagination, tables, menus, and status controls understandable and consistent.
- Preserve role-based navigation and access rules. Hiding a UI item is never a substitute for server-side authorization.
- Avoid introducing extra clicks or new steps without a clear usability benefit.

### 4.5 Forms and service-request flows

- Keep forms focused, logically grouped, and easy to scan.
- Use persistent labels; never rely on placeholder text as the only label.
- Clearly indicate required fields and explain validation errors next to the relevant controls.
- Preserve current validation, eligibility checks, submission behavior, workflow states, and API contracts.
- Prevent accidental duplicate submissions where appropriate and consistent with the existing implementation.
- Make loading, success, empty, error, and disabled states clear.
- Use suitable input types and keyboard behavior. Preserve entered values after recoverable validation errors where practical.
- Do not add fields, steps, or requirements unless the existing civic-service process requires them.
- Preserve privacy and protect sensitive personal information.

### 4.6 Responsive behavior

Check key affected screens at representative mobile, tablet, and desktop widths.

- Prevent unintended horizontal page overflow, clipped content, and inaccessible dialogs or menus.
- Stack content naturally on smaller screens and keep primary actions easy to locate.
- Make tables usable on mobile with the simplest suitable approach: responsive columns, a contained horizontal scroll region, or an existing project pattern.
- Ensure navigation, dropdowns, dialogs, forms, filters, and upload controls work with touch and keyboard.
- Do not create duplicate desktop and mobile implementations unless the current architecture genuinely requires it.

### 4.7 Accessibility and inclusive design

Aim for practical WCAG 2.2 AA-aligned behavior where feasible.

- Use semantic HTML and a logical heading order.
- Support keyboard navigation and visible focus indicators.
- Ensure adequate contrast; target at least 4.5:1 for normal text and 3:1 for large text and meaningful UI boundaries where applicable.
- Give form controls programmatic labels and associate errors with their fields.
- Provide accessible names for icon-only controls.
- Do not rely only on color, hover, or animation to convey meaning.
- Respect reduced-motion settings.
- Use clear language and avoid unnecessary jargon.
- Test key flows with keyboard-only navigation where practical.

## 5. Super-Subagent Team and Parallel Work

Use Codex's available multi-agent/subagent capability to delegate independent investigation and review tasks in parallel when supported. Do not assume a tool or spawn mechanism is available if it is not. If true subagents are unavailable, perform the same role-based reviews in separate focused passes and report the limitation honestly.

### Agent roles

| Agent | Responsibilities | Boundaries |
|---|---|---|
| **1. Lead / Orchestrator Agent** | Inspect the repository, establish scope, assign tasks, resolve conflicts, integrate changes, and make final acceptance decisions. | Avoid overlapping file ownership and unnecessary delegation. |
| **2. UI/UX Designer Agent** | Audit existing screens and the reference; recommend hierarchy, layout, spacing, typography, color, and interaction improvements. | Analyze and recommend first; do not change business logic or database code. |
| **3. Frontend Implementation Agent** | Apply approved UI changes to assigned pages, components, and styles using existing conventions. | Preserve current props, routes, APIs, and behavior; edit only assigned areas. |
| **4. Content & Usability Agent** | Identify verbose copy, confusing labels, repeated instructions, unclear empty states, and excessive information density; propose concise wording. | Preserve civic-service meaning, eligibility rules, deadlines, legal/privacy notices, and required instructions. |
| **5. Accessibility & Responsive Agent** | Review keyboard access, focus, labels, contrast, responsive layouts, overflow, and UI states. | Make scoped changes only when assigned; report evidence and verification steps. |
| **6. Reviewer / Regression Agent** | Independently inspect the actual diff and check requirements, regressions, consistency, and scope. | Review objectively; do not approve work merely because another agent completed it. |
| **7. Debugging & Test Agent** | Run available tests, linting, type checks, builds, and focused flow checks; reproduce failures and identify root causes. | Fix verified regressions only; never suppress failures or weaken tests to get a pass. |

### Parallel execution and concurrency rules

1. The Lead Agent inspects the project and creates a short prioritized task list first.
2. Run independent, read-only work in parallel where supported: reference analysis, UI audit, content audit, and test/tooling discovery.
3. Require each agent to report concrete findings: affected screens/files, observed problem, minimal recommendation, risk, and verification method.
4. Consolidate findings before implementation and assign clear, non-overlapping ownership.
5. Parallel code edits are allowed only when files and responsibilities are independent. **Do not allow multiple agents to edit the same component, stylesheet, or shared configuration concurrently.**
6. Give shared design tokens, app shells, navigation, and common components one designated owner. Other agents should submit recommendations rather than competing edits.
7. Integrate work centrally and inspect for conflicting styles, duplicate components, inconsistent tokens, and incompatible assumptions.
8. Run independent review and testing after integration; consolidate findings before the next iteration.
9. Keep agent tasks small, explicit, and testable. Do not ask agents to add speculative features or expand scope.
10. If an agent is unavailable or returns incomplete findings, continue with available roles and record the limitation rather than blocking all work.

## 6. Loop Engineering — Inspect → Plan → Implement → Verify → Review → Fix

Repeat this loop until the acceptance criteria are met or a genuine blocker is documented.

### Phase A — Inspect

- Understand the repository, existing UI patterns, and available verification commands.
- Map important screens and user journeys.
- Identify visual inconsistencies, dense text, unclear navigation, low-contrast controls, accessibility barriers, and responsive issues.
- Establish behavior and data contracts that must remain unchanged.

### Phase B — Plan

- Prioritize issues by user impact, frequency, and risk.
- Define the smallest useful set of changes.
- Specify affected files/components, owner, and acceptance criteria.
- Avoid bundling unrelated changes into one task.

### Phase C — Implement

- Work in small, reviewable increments.
- Reuse and improve existing components rather than creating duplicates.
- Prefer existing dependencies, utilities, tokens, and patterns.
- Keep UI changes separate from backend/business-logic changes wherever possible.
- Do not change database schema, migrations, APIs, authentication, authorization, or civic-service rules for cosmetic reasons.
- If a deeper change seems necessary, document the evidence and choose the least invasive safe solution before proceeding.

### Phase D — Verify

Run applicable checks supported by the repository, such as:

- Existing automated tests.
- Frontend linting and type checking, if configured.
- Production/build compilation.
- Relevant backend tests and route/configuration checks.
- Browser verification of changed screens when browser tools are available.
- Responsive checks at mobile, tablet, and desktop sizes.
- Keyboard and accessibility checks for changed interactions.
- Focused checks of the existing civic-service journeys affected by the changes, such as browsing a service, submitting or editing a request, viewing request status, or using role-specific access **only where those actions already exist**.

### Phase E — Independent review

The Reviewer Agent must inspect the actual diff and ask:

- Does the UI follow the requested visual direction while remaining recognizably Requisito?
- Did any existing feature, route, workflow, permission, validation, or data contract change unexpectedly?
- Is the text easier to scan without losing civic-service meaning?
- Are controls readable, consistent, accessible, and usable?
- Does the layout work at mobile and desktop sizes?
- Were unnecessary dependencies, abstractions, files, or duplicate components introduced?
- Are there console errors, failed requests, broken assets, or test regressions?
- Is any change broader than necessary?

### Phase F — Fix and repeat

- Reproduce each verified issue.
- Fix the root cause with the smallest safe change.
- Rerun the failed check and relevant regression checks.
- Repeat review and verification after meaningful changes.
- Stop when acceptance criteria pass and no known high-impact regressions remain.
- Do not pursue subjective pixel perfection at the expense of stability, accessibility, or scope.

**Never claim that a test, browser check, or build passed unless it was actually run and passed.** If a check cannot be run, explain why and what remains unverified.

## 7. Scope and Change Control

### In scope

- UI styling, layout, spacing, typography, colors, and visual consistency.
- Navigation clarity and information hierarchy.
- Shorter, clearer interface copy.
- Existing component usability, accessibility, and responsive behavior.
- Fixes for verified UI bugs discovered during the refresh.
- Small component refactors only when they directly reduce duplication or enable a requested improvement.

### Out of scope unless necessary and explicitly justified

- Rebuilding Requisito or replacing its frontend/backend architecture.
- New modules, civic services, roles, dashboards, or workflows.
- Database redesign, schema changes, migrations, or data resets.
- Replacing authentication, authorization, APIs, or business logic.
- Changing eligibility rules, application requirements, request status logic, deadlines, fees, notifications, or reporting behavior.
- Installing a new UI framework or a large dependency for a small visual improvement.
- Large-scale renaming, folder restructuring, or unrelated cleanup.
- Fake data presented as real, placeholder integrations, or unfinished buttons.
- Copying BetterSolano branding, content, or assets.

If a visual change appears to require an out-of-scope modification, pause and report the reason, risk, and least invasive alternative before proceeding.

## 8. Definition of Done / Acceptance Checklist

The work is complete only when all applicable items are checked.

### Visual and content quality

- [ ] The interface feels cohesive, modern, trustworthy, and appropriate for Requisito.
- [ ] Useful service-oriented design principles from the reference are adapted to Requisito.
- [ ] Each affected page has clear hierarchy and an obvious primary action.
- [ ] Text is concise, scannable, and free of avoidable repetition.
- [ ] Essential eligibility, deadline, fee, privacy, consent, and legal information remains accurate and intact.
- [ ] Buttons, labels, forms, tables, and status indicators are readable.
- [ ] Shared components use consistent spacing, typography, colors, and interaction states.

### Usability and accessibility

- [ ] Key changed screens work at mobile, tablet, and desktop sizes.
- [ ] No new unintended overflow, clipping, or inaccessible dialogs/menus exists.
- [ ] Keyboard access and visible focus work for changed interactions.
- [ ] Form labels, validation messages, contrast, and status communication are appropriate.
- [ ] Loading, success, empty, error, and disabled states are clear where relevant.

### Functional integrity

- [ ] Existing routes, roles, permissions, data contracts, and business rules are preserved.
- [ ] Existing user journeys affected by the refresh still work.
- [ ] No unintended database or backend changes were made.
- [ ] No fake functionality or dead-end buttons were introduced.
- [ ] Relevant tests, lint/type checks, and build checks pass, or limitations are documented.
- [ ] Reviewer and Debugging/Test Agent findings are resolved or clearly documented.

### Simplicity and delivery

- [ ] No unnecessary dependencies, duplicate components, or speculative features were added.
- [ ] Changes are limited to the intended UI/UX refresh.
- [ ] The final diff has been reviewed.
- [ ] The final report states what changed, what was tested, results, and known limitations.

## 9. Final Report Format

When finished, provide a concise summary with:

1. **UI/UX improvements:** key changes and affected screens.
2. **Content improvements:** categories or examples of text shortened.
3. **Files changed:** key files or areas.
4. **Validation:** checks actually run and their outcomes.
5. **Preserved behavior:** important existing journeys reviewed.
6. **Known issues:** unresolved or untested items and why.

Do not claim perfection. Report verified results honestly.

---

## Final Instruction

**Refresh Requisito; do not create a new system.** Make the existing civic-services application clearer, more concise, consistent, accessible, responsive, and easier to use. Use BetterSolano as visual inspiration, coordinate parallel subagents where supported, keep file ownership clear, and iterate through testing and independent review. Choose the simplest safe implementation. **K.I.S.S. always.**
