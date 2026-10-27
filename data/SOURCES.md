# Davao data source inventory

Inventory date: 2026-10-27 (Asia/Manila).

This is a provenance inventory, not a verification claim. The civic catalogs
are maintained under `src/data/`; their records carry their source in
`sourceUrl`, and reviewed records carry `lastVerified`. The local
`./bettersolano` reference clone was inspected on this date. Its datasets are
Solano-specific (and some contain placeholders or draft values), so none were
used to populate Davao catalogs. Existing `verification: "unverified"` values
must not be promoted based on this inventory.

Reference inspected: https://github.com/BetterSolano/bettersolano (retrieved
2026-10-27). Its README, migration guide, license, static feature files, and
React app were reviewed for scope only. This is not a Davao City civic-data
source.

| Dataset | Current location | Source and state |
| --- | --- | --- |
| City services and hotlines | `src/data/services.json` | Per-record `sourceUrl`; records remain unverified. Retrieve and review each City, agency, and hotline source before treating details as current. |
| Officials and departments | `src/data/officials.json` | Per-record source leads; holder names remain null unless verified. No complete Davao department-head roster was established in this pass. |
| Barangays and districts | `src/data/barangays.json` | Existing compiled list is explicitly unverified and is not an official source dataset. Obtain and cite City/PSA records before asserting names, boundaries, or population values. |
| City facts | `src/data/cityFacts.json` | Per-record source links; facts remain unverified. |
| News and notices | `src/data/updates.json`, `src/data/featureCatalogs.json` | City-published notice URLs are stored on records; entries remain unverified and time-sensitive where indicated. |
| Budget | `src/data/budget.json` | City-published 2026 budget article: https://davaocity.gov.ph/local-government/sp-oks-davao-citys-15-8-b-2026-budget/ . The three allocations remain unverified and are not an audit or project-disbursement dataset. |
| Procurement and DPWH projects | `src/data/procurement.json` | Empty. No Davao-specific award/project dataset was loaded or validated in this pass. |
| Ordinances and resolutions | `src/data/featureCatalogs.json` | Contains City transparency/archive source leads only; no complete searchable ordinance/resolution corpus was established. |
| Demographics, economy, competitiveness | `src/data/barangays.json`, `src/data/cityFacts.json`, `src/data/featureCatalogs.json` | No verified, complete statistics datasets were established. Population values in the barangay list remain null. |
| History | `src/data/history.json` | Empty pending dated, source-backed Davao history records. |

Retrieval-date limitation: most existing record schemas do not store a retrieval
date separate from `lastVerified`. Historical retrieval dates therefore cannot
be asserted from the local data. Record a retrieval date when source review is
performed; keep it distinct from verification status and date. The inventory
date above records this documentation review, not a fresh retrieval or
verification of each dataset URL.
