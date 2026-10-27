# Part 4 inventory

## Routes and data

All routes render inside the shared `Layout` (`header`, primary navigation,
`main`, and `footer`). Data-backed routes read JSON through
`src/data/helpers.js`, except the standalone authentication context and
planning-question utilities.

| Route | Page file | Data source | Current state |
| --- | --- | --- | --- |
| `/` | `src/pages/Home.jsx` | Shared catalog count and Status report | Summary cards show the audit-scope total, barangays, and unverified non-sample records. |
| `/login` | `src/pages/Login.jsx` | In-memory auth context | Sign-in form; no server account. |
| `/goals` | `src/pages/Goals.jsx` | `goals.json`, shared requirements | Searchable, categorized goals display counts derived from active requirement records. |
| `/goals/:slug` | `src/pages/GoalDetail.jsx` | Goal, requirement, and source catalogs | Requirement conditions, source claims, unresolved research, and checklist entry are displayed together. |
| `/checklist` | `src/pages/Checklist.jsx` | Goal and canonical requirement definitions | Conditional checklist with four progress statuses, guide links, and browser-profile-only progress. |
| `/documents` | `src/pages/Documents.jsx` | Guide-enabled canonical requirements | Searchable document guides derived from requirement definitions; no personal document storage. |
| `/documents/:slug` | `src/pages/DocumentGuide.jsx` | Requirement, goal, and source catalogs | Guide shows linked goals, conditions, sources, and limits. |
| `/questions` | `src/pages/QuestionFlow.jsx` | Planning rules/questions and requirements | Conditional question flow is data-backed. |
| `/services` | `src/pages/Services.jsx` | `services.json` | Service and hotline records are listed. |
| `/services/:slug` | `src/pages/ServiceDetail.jsx` | `services.json` | Record profile or not-found state. |
| `/barangays` | `src/pages/Barangays.jsx` | `barangays.json` | 182 unverified names; URL-driven query/district/sort filters and filtered CSV export. |
| `/barangays/:slug` | `src/pages/BarangayProfile.jsx` | `barangays.json` | Profile, population-unavailable label, and same-district previous/next links. |
| `/districts` | `src/pages/Districts.jsx` | `barangays.json` | Administrative district directory with barangay counts. |
| `/districts/:name` | `src/pages/DistrictProfile.jsx` | `barangays.json` | District profile and linked barangays with population-unavailable labels. |
| `/about-davao` | `src/pages/AboutDavao.jsx` | `cityFacts.json` | Source-linked facts, all unverified. |
| `/updates` | `src/pages/Updates.jsx` | `updates.json` | Source-linked updates. |
| `/officials` | `src/pages/Officials.jsx` | `officials.json` | Office list; holders are not asserted. |
| `/officials/:slug` | `src/pages/OfficialProfile.jsx` | `officials.json` | Office profile or not-found state. |
| `/search` | `src/pages/Search.jsx` | Grouped catalogs via `searchAll()` | Accent-insensitive ranked search, URL query/type filter, and safe result highlighting. |
| `/status` | `src/pages/Status.jsx` | Verification metadata from civic catalogs and canonical requirements | Counts, review age, time-sensitive records, and gaps; document guides are not duplicated as separate records. |
| `/contribute` | `src/pages/Contribute.jsx` | Existing catalog records | Local correction form prepares a public GitHub issue. |
| `/credits` | `src/pages/Credits.jsx` | Static project documentation | Static credits page. |
| `/history` | `src/pages/History.jsx` | `history.json` | Empty state; no history entries supplied. |
| `/budget` | `src/pages/Budget.jsx` | `budget.json` | Three unverified 2026 fund allocations transcribed from the linked City budget article; the page filters by fiscal year and displays each fund's share of the listed allocations. |
| `/procurement` | `src/pages/Procurement.jsx` | `procurement.json` | Empty state; no procurement rows supplied. |
| `/briefs` | `src/pages/Briefs.jsx` | `briefs.json` | Three unverified, source-linked guides. |
| `/monitor` | `src/pages/Monitor.jsx` | Derived catalog and source-watch state | Local catalog status; source watch has not run. |
| `/elections` | `src/pages/Elections.jsx` | `elections.json` and the official COMELEC link | One unverified source link; no candidates or results. |
| `/accountability` | `src/pages/Accountability.jsx` | `accountability.json` | Empty state; no official documents supplied. |
| `/participate` | `src/pages/Participate.jsx` | `services.json` plus static guidance | Contact record plus unverified guidance. |
| `/integrity` | `src/pages/Integrity.jsx` | Derived status counts and static policy copy | Transparency and methods disclosures. |
| `*` | `src/pages/NotFound.jsx` | None | Not-found state. |

## Language switching

`src/i18n/LanguageContext.jsx` stores the selected language in browser
`localStorage` under `requisito-language`; it falls back to English if storage
is unavailable. `Layout.jsx` renders the selector. Translations live in
`src/i18n/en.json`, `fil.json`, and `ceb.json`; all catalogs share keys and
missing keys fall back to English with a development warning. The document
language is updated by the provider effect. Locale copy remains pending
native-speaker review.

## Search and status counts

`searchAll()` is in `src/data/helpers.js`. It searches grouped civic catalogs,
including districts. Matching folds accents and ranks exact title, title
prefix, title substring, and other-field matches; samples and placeholders are
excluded. Search query and type are reflected in the URL. Barangay filters
also use query parameters and provide a CSV export of the visible real records.

The Home total and data audit use the same centralized counter for civic JSON
catalogs plus requirements. The current audit total is 219. Document guides
are derived from requirements and are not counted as separate civic records;
Home's unverified count is derived separately from the Status report's
non-sample gaps.

All route components are lazy-loaded from `src/App.jsx`. Keyboard focus moves
to each new page heading, document titles follow the current page, focus styles
are visible, and the CSS includes responsive filters, district cards, and
overflow-safe tables. Mobile and desktop visual checks were not performed in
this pass.

## Hard-coded figures and data limitations

- `STALE_DAYS` is set to 90 in `src/data/helpers.js`; it is a review-window
  setting, not a claim about Davao.
- `src/data/cityFacts.json` contains unverified supplied figures: 182
  barangays, three legislative districts, eleven administrative districts,
  1,776,949 residents in 2020, 2,443.61 square kilometers, and 80,538 for
  Bucana. The data pack notes these sources and review limitations.
- Goal membership is stored in `goals.json` requirement ID references.
  `requirements.json` holds canonical requirement definitions and
  `requirementSources.json` holds linked evidence with claim limits. First-job
  suggestions without sources are not universal requirements; Davao
  health-card details remain unverified historical claims.
- The page presents no barangay population values; the imported fields remain
  `null` pending a PSA merge.
