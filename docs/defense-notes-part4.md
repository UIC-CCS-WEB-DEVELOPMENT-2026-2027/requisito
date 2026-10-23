# Part 4 defense notes

## What changed

- Route-level lazy imports reduce initial route code; district directory and
  profile routes reuse the existing barangay catalog.
- Barangay and global search state is represented in URL parameters so results
  can be shared, refreshed, and navigated with browser history.
- Search normalizes accents, ranks title matches ahead of other-field matches,
  and highlights matched text through React rendering rather than HTML
  injection.
- The shared record counter is used by the dashboard and audit. The four
  illustrative document tracker entries are not part of the civic audit total.
- Translation catalogs now cover the interface in English, Filipino, and
  Bisaya. Filipino and Bisaya copy still needs native-speaker review.
- Shared empty states, visible focus, heading focus after route changes,
  document titles, responsive filters, and scrollable data tables support
  clearer keyboard and narrow-screen use.

## Data integrity and limitations

- Barangay populations remain null; imported names and district assignments
  remain unverified.
- Search and counts do not establish that a record is accurate or current.
- Civic record text and source claims remain in English and retain their
  original verification state.
- CSV export includes only the currently visible, non-sample barangay records.
- No new account, backend, or persistence behavior was added.

## Verification

- `npm run build`: passed.
- `node --test`: 61 tests passed.
- Manual browser checks, including desktop and 360px layouts, were not run.
