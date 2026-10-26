# Translation review

The interface has English, Filipino, and Bisaya (Cebuano) catalogs in
`src/i18n/en.json`, `src/i18n/fil.json`, and `src/i18n/ceb.json`. The English
catalog is the source for interface copy. The locale files currently have
matching key sets, which is checked by `src/tests/i18nCatalog.test.js`.

| Locale | Status | Review needed |
| --- | --- | --- |
| English | Source copy | Editorial review for clarity and consistent labels. |
| Filipino | Needs native-speaker review | Check natural wording, spelling, and civic terminology. |
| Bisaya (Cebuano) | Needs native-speaker review | Check local phrasing, spelling, and civic terminology. |

No locale translation changes civic record titles, descriptions, dates, source
claims, or verification states. Catalog content remains English; only
interface labels and guidance are localized. Missing keys fall back to English
and emit one development warning per language/key.

Part 6 adds translations for the route-family empty states, service-guide
filters, source-lead warnings, assistant dialog controls, and help/privacy/terms
copy. Those Filipino and Bisaya strings are still draft translations and have
not been reviewed by native speakers. The assistant receives the selected
interface language (`en`, `fil`, or `ceb`) so the provider is asked to reply in
that language; this does not replace human translation review.

Before release, have native speakers review each translated string in context,
especially form errors, authentication notices, document/checklist terminology,
privacy guidance, and source-verification language. Update the catalog review
metadata only after that review is complete.
