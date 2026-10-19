# Goal selection and question flow wireframes

Historical prototype: the Week 2 static sprint supersedes this questionnaire
flow with Home, Goals, Checklist, and Documents. `/questions` now redirects to
`/checklist`. See `data-contract.md` for the current shared data format.

## Screens

- **Goal selection (`/goals`)** presents three sample goals as selectable cards. A selected card is highlighted, and continuing without a selection displays a prompt.
- **Question flow (`/questions`)** asks four goal-specific questions, one at a time. The progress bar, selected goal, answer choices, and Back/Next controls keep the short flow clear. Answers are retained when moving between questions or routes.
- **Checklist result (`/checklist`)** presents a goal-specific set of practical steps, highlights the selected focus, and shows completion progress as tasks are checked or unchecked. Users can review their answers or start again.

## Workflow and interactions

The prototype follows **goal selection → question flow → checklist result**. State is held in React at the app level, so the selected goal, responses, and task completion remain available while navigating. Changing goals clears answers and checklist completion. The sample checklists are predefined; the first answer is shown as the plan focus. No backend, account, or AI service is used.

## Responsive layout

Goal cards use a two-column grid on wider screens and stack on narrow screens. Question choices and checklist rows fill the available width, while navigation buttons wrap and become easier to tap on mobile. The content container and progress bars scale to the viewport without horizontal scrolling.
