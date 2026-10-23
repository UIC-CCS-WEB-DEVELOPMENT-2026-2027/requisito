# Part 2 defense notes

- Source watch hashes normalized page text and compares it with the last stored hash. It reports changes but never edits a civic record or its verification date.
- The budget and procurement importers read CSV text, validate columns and values, then write every imported row as unverified.
- Budget share bars are ordinary CSS elements with proportional widths and text labels, so no chart dependency or color-only meaning is needed.
- City Monitor derives its coverage, stale-record list, time-sensitive list, source-watch counts, and gaps from local JSON data.
- Accountability starts empty because no official Davao documents were supplied; no examples or accusations are invented.
- Each record view includes its verification state, review date or “Never verified,” and source link or an explicit missing-source message.
- `searchAll` excludes records flagged as samples before returning grouped matches.
- The language provider looks up the selected language first and falls back to the English catalog when a key is missing.
- The source-watch workflow uses the preinstalled GitHub CLI to clone and propose a review pull request rather than relying on third-party marketplace actions.
- BetterMakati contributed feature and workflow patterns only; Requisito reimplemented them in its own JavaScript, React Router, CSS, and data structures without Makati content or copied files.
