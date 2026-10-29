# Davao civic parity, Part 6

This is the final Part 6 route and data map. Empty states are intentional where
the repository has no sourced Davao dataset; they are not claims that a
government service or record does not exist. Existing catalog verification and
`lastVerified` values were not changed.

| Feature family | Requisito route(s) | UI / data source | Part 6 result |
| --- | --- | --- | --- |
| Service guide directory | `/service-guides` | `ServiceGuides`, `ServiceGuideFinder`, `GuideCard`, `getVerifiedGuides` | Implemented. Category filter uses complete, verified briefs only; current result is empty. |
| Where-to-go finder | `/where-to-go` | `WhereToGo`, shared `ServiceGuideFinder`, `filterVerifiedGuides` | Implemented. No unverified guidance is presented as an instruction. |
| Service-location Maps | `/services`, `/services/:slug` | `ServiceCard`, shared `ServiceMapActions`, `utils/maps.js`, `services.json` | Implemented on listing cards and detail pages. Four records with usable address fields show destination and directions links; three show a localized unavailable-location state. Addresses remain unverified and display a review warning. Browser-checked at 375px and 1440px; keyboard focus is visible. |
| Conditional requirement checklist | `/checklist?goal=7` | `Checklist`, `RequirementCard`, `requirements.json`, `planningRules.js`, `planGenerator.js` | The January 2026 health-card notice is identified as historical/unverified; food-industry and pink-card conditions are separated, “not sure” keeps items visible, and unsupported document ordering is explicitly disclaimed. No requirement is marked verified. SSR, generator, audit and browser checks cover the flow; current details need City Health Office review. |
| Unsupported goal empty state | `/checklist?goal=2` and other empty goals | `Checklist`, `goals.json`, localized catalogs | Says no sourced checklist is available—not that the agency has no requirements—and links to service/source leads. |
| City map | `/map` | `GovernmentLocations`, service-address catalog, Google Maps search links | Searchable address leads from existing service records; addresses remain explicitly unverified and no coordinates are invented. |
| Civic reports and report details | `/reports`, `/reports/:slug`, `/civic-reports` | `FeaturePage`, `reports`, City Reports portal | No user reports are fabricated or collected; the civic-report page links to the City's separate portal and warns users to review its privacy notice. |
| Nearby reports | `/nearby-reports` | `FeaturePage`, `reports` | Implemented without location capture or user submission. |
| Public assets | `/assets` | `FeaturePage`, `assets` | Implemented with an empty inventory; no asset list was supplied. |
| City calendar and live feed | `/calendar`, `/live` | `FeaturePage`, `events`, existing `updates` route | Calendar includes a dated, source-linked Pasko Fiesta 2026 competition notice; it is not represented as a complete events schedule. |
| Community tools and concern routing | `/community-tools`, `/concern-finder` | `FeaturePage`, `communityTools`, existing search and services routes | City-listed online portal directory is populated; concern routing remains unconfigured rather than offering unreviewed classifier rules. |
| Contact | `/contact` | `FeaturePage`, existing services catalog, `OfficialSourceLeads` | Implemented. Contact action is disabled and marked not configured; directory links are explicitly unverified leads. |
| Public document lookup | `/document-lookup` | `FeaturePage` | Implemented as an honest unavailable state; the former `/documents` tracker has since been replaced by searchable document guides in Phase 2. |
| Public records and record details | `/public-records`, `/public-records/:slug` | `FeaturePage`, `publicRecords` | Populated with source-linked City transparency archive indexes and two ordinance entries; each remains explicitly unverified and links to the City source. |
| Legislation | `/legislation` | `FeaturePage`, `publicRecords`, existing accountability and officials routes | Includes links to City-published ordinance archive pages; this is not a complete legal archive or legal interpretation. |
| Civic audit and results | `/civic-audit`, `/civic-audit/results` | `FeaturePage`, `civicAuditEntries` | Implemented with empty states; no public-body scoring or unsupported conclusions. |
| Government directory | `/government` | `FeaturePage`, existing `/officials` and `/services` | Implemented as a directory of related source-backed pages, not a duplicate data set. |
| Heritage | `/heritage` | `FeaturePage`, `heritageSites` | Includes a source-linked Museo Dabawenyo entry; visitor arrangements remain unverified. |
| Mobility and transit | `/mobility` | `FeaturePage`, `transitRoutes` | Includes the City's dated 2019 Transport Roadmap as a planning reference, not a current route or schedule. |
| Tourism | `/tourism` | `FeaturePage`, `tourismPlaces` | Includes City-sourced cultural tourism and museum leads; no current access, hours, or schedules are asserted. |
| Cinemas | `/cinemas` | `FeaturePage`, `cinemas` | Implemented with an empty state; no venue list was supplied. |
| Estates / property | `/estates` | `FeaturePage`, `estateListings` | Implemented with an empty state; no listings or market claims. |
| Statistics | `/statistics` | `FeaturePage`, existing `/status` and `/monitor` | Implemented with links to local catalog-derived counts; no separate statistics data was fabricated. |
| Help | `/help` | `FeaturePage`, services, service guides, search | Implemented with the existing goal → questions → checklist flow explained. |
| Privacy and terms | `/privacy`, `/terms` | `FeaturePage` | Implemented as clearly marked drafts, not represented as legal advice or reviewed policy. |
| Existing civic coverage | `/`, `/services`, `/barangays`, `/districts`, `/updates`, `/officials`, `/history`, `/budget`, `/procurement`, `/briefs`, `/elections`, `/accountability`, `/participate`, `/integrity` | Existing pages and JSON catalogs | Preserved. The budget page includes three City-reported 2026 fund allocations, explicitly unverified; other existing records retain their verification state. |
| Route and link integrity | All routes in `src/routeManifest.js`; admin paths in `adminRoutes` | `href`, `routeMatches`, `scripts/audit-links.mjs`, `scripts/route-smoke.test.mjs` | Implemented and automated. Internal paths are checked against the manifest; public rendered routes are smoke-tested. |
| Assistant experience and guardrails | Header dialog and existing Checklist assistant | `ChatAssistant`, `askAssistant`, `netlify/functions/chat.js`, `assistant-records.js`, `gemini.js` | Extended with accessible dialog behavior, validated page context, selected language, numeric-claim checks, and a configurable daily cap. No live provider calls were made in this work. |

## Data and safety boundaries

- `src/data/featureCatalogs.json` contains source-linked, unverified records for the civic sections with available City sources. Citizen-submitted reports, civic audit scores, assets inventory, cinema lists, and estate listings remain empty rather than being fabricated.
- The existing service and brief records remain unverified; guides therefore
  show no results until independently verified complete records are supplied.
- The budget page displays three allocations transcribed from a City-published
  2026 budget article. The linked report is not an independent audit, and the
  records remain unverified.
- Source links are leads, labeled unverified. A URL alone is not proof that its
  page is current or supports a claim.
- No user-submitted reports, location capture, backend, new public API, or
  fabricated civic records were added.
- `/contact` has a visibly unconfigured address and a disabled action. It does
  not claim that a message was sent. The existing correction form still only
  prepares a public GitHub issue; that external step is not submission to a
  government office.
- The Filipino and Bisaya strings are draft translations and require a native
  speaker review.

The original implementation decisions and unresolved data gaps remain
documented in [the Part 2 parity matrix](./parity-matrix.md) and
[the data contract](./data-contract.md).
