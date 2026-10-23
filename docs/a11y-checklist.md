# Accessibility manual checklist

Run these checks after the language strings or layout change. Include desktop
and a 360px-wide viewport.

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
- [ ] Confirm no record's unverified state is hidden and sample barangays are
  clearly labeled.
