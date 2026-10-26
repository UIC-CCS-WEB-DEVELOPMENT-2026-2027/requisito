# Accessibility manual checklist

Run these checks after the language strings or layout change. Include desktop
and a 360px-wide viewport.

## Reproducible core browser walkthrough

Start the existing app from the repository root with `npm run dev`, then open
the local URL printed by Vite. This walkthrough uses only the public UI and
browser-local checklist storage:

1. Open `/goals`, choose **Apply for first job**, and open its checklist.
2. Change each employer-request question between its available answers. Confirm
   conditional requirements appear only for matching answers and the order
   remains usable.
3. Change one checklist item to in progress, then to ready. Refresh the page and
   confirm both the answer and status persist. Open its document guide, use the
   return link, and confirm the same goal and progress remain selected.
4. Open `/checklist?goal=2` (a goal without a supported requirements catalog).
   Confirm it shows the research-pending state and never reports “Ready to
   apply.”
5. Repeat the first-job flow at desktop width and 360px. Complete the keyboard
   checks below, including tabbing through questions, status controls, guide
   links, and navigation.

For a production-preview walkthrough, run `npm run build` followed by
`npm run preview`, then use the local URL printed by Vite Preview. If either
server cannot bind to localhost in a restricted environment, do not weaken
server settings or production behavior; run these steps in a local environment
that permits localhost listeners and record the restriction instead.

## HTTP integration tests

Run `npm test` from the repository root. The HTTP integration tests create a
temporary listener on `127.0.0.1` using an ephemeral port, so the test
environment must permit loopback listeners. If Node reports `listen EPERM`,
the tests did not reach their HTTP assertions; rerun `npm test` in a local
environment where loopback networking is authorized. Do not change the tests
or production listener configuration to bypass that restriction.

- [ ] Tab from the address bar and confirm the skip link appears on focus and
  moves focus to the main content.
- [ ] Navigate every primary and footer link with Tab / Shift+Tab and Enter.
- [ ] At 360px, navigate the single-row primary navigation with keyboard and
  confirm the language control remains reachable.
- [ ] Change languages with the keyboard and check labels update; reload to
  confirm the selected language persists when storage is enabled.
- [ ] Block local storage and confirm the app falls back to English without a
  blank page.
- [ ] Confirm each input has a visible or programmatic label, including search,
  service filters, sign-in, and contribution fields.
- [ ] Submit empty and invalid forms; confirm readable inline messages are
  announced and focus remains usable.
- [ ] Search for results and for no results; confirm counts are announced.
- [ ] Confirm verification states, "Never verified", time-sensitive notices,
  and source links are distinguishable without color alone.
- [ ] Use browser zoom and check that cards, details, and forms reflow without
  horizontal page overflow.
- [ ] Check text/background contrast in light and dark system themes; body text
  and interactive text must meet WCAG AA 4.5:1 for normal text.
- [ ] Confirm links and controls have visible focus and at least 44px touch
  targets; check telephone links on a mobile device.
- [ ] Enable reduced motion and confirm transitions/scroll behavior are
  minimized.
- [ ] Confirm no record's unverified state is hidden and that real barangays
  have no sample badge.
- [ ] Check each Part 2 route: `/history`, `/budget`, `/procurement`, `/briefs`,
  `/monitor`, `/officials/:slug`, `/elections`, `/accountability`,
  `/participate`, and `/integrity`.
- [ ] Check `/districts` and `/districts/:name`; follow a district link to a
  barangay profile and return using the breadcrumb.
- [ ] Filter `/barangays` using the search, administrative and legislative
  district controls, sort controls, and CSV export at desktop and 360px.
- [ ] Open a filtered `/search?q=...` result, change its type filter, and check
  that the URL and highlighted result remain usable with keyboard navigation.
- [ ] Use the budget year selector, procurement search/status filters, and
  accountability search with keyboard only; confirm result/status updates are
  announced.
- [ ] Confirm every data table has a useful caption and scoped header cells,
  and can be scrolled at 360px without page-wide horizontal overflow.
- [ ] Confirm CSS bars have accessible text alternatives and the numeric
  proportions are also presented as text where applicable.

Part 4 validation note: no manual browser, desktop, 360px, or assistive
technology checks were performed. `npm run build` and `node --test` were used
for automated verification only; complete the checks above manually.
