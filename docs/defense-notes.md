# Defense notes

- Data starts in JSON catalogs, is copied or filtered by helpers, and reaches
  pages and cards through their props.
- `useState` holds local form and filter values; React Context shares the
  selected interface language without passing it through every component.
- `searchAll` trims and lowercases a query, scans the supported catalogs, and
  returns matching records grouped by type; sample barangays are excluded.
- `verification` tells whether a source was reviewed, `sourceUrl` points to the
  evidence, and `lastVerified` records when a human checked it.
- The Sources and Status page calls a helper that derives counts, stale records,
  time-sensitive items, and known gaps from the catalogs.
- The AI provider key stays in server environment configuration; the browser
  calls a server function and never receives the key.
- Normal assistant requests use only records that pass the verified-source
  checks; local test mode is visibly marked and cannot claim verified guidance.
- The service directory uses route slugs, while CSV import produces consistent
  barangay slugs and keeps every imported row unverified.
- BetterMakati inspired the kinds of civic information and the source-aware
  contribution flow; its content and code were not copied into Requisito.
- I reimplemented those patterns because this project uses React JavaScript and
  plain CSS, and because Davao records need their own sources and review state.
