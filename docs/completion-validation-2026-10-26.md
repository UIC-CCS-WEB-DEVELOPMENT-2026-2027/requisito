# Completion and validation — 26 October 2026

Engineering validation is complete for the changes described below. Government
publication remains **BLOCKED**. This report supersedes earlier execution,
PDF-access and bundle-size limitations, not the independent approval policy.

## Delivered behavior

- Checklist cards expose their canonical source records in expandable details,
  with narrow claims, limitations, dates, and honest review status.
- The checklist overview identifies the next unfinished applicable item and
  supplies actual values in its accessible progress description.
- Goal cards load their own shared styles on direct navigation; actions have
  distinct spacing and 44px minimum height. Category selections survive locale
  changes, and goal search includes translated titles/descriptions.
- NBI demo prompts link to the existing instruction source; SSS and PhilHealth
  prompts use specific membership/employee pages rather than homepages.
  Passport appointment prompt 18 uses the retrieved official appointment route.
  These remain demonstration prompts, not verified policy.
- Framework and translation chunks cache independently of civic-data changes.
- Stale E2E expectations were repaired; tests now exercise the available demo
  checklist and verification history rather than expecting their absence.
- A tracked stale Playwright result was removed; test output is ignored.

## Supplied PDFs

Actual files, read inside the workspace using macOS PDFKit without escalating
PDF access:

| File under `docs/source - pdfs/` | Pages | Origin and scope |
| --- | ---: | --- |
| `Document requirements (Requisito).pdf` | 3 | Requisito compilation, 19 October 2026; largely secondary guide references and explicit unresolved claims |
| `Requisito_Government_IDs_and_First_Job_Requirements.docx.pdf` | 13 | Requisito research handoff, 20 October 2026; nine processes, source register, conflict tables, six-record appendix |

All pages were text-extracted and read. The source-register table on page 7
and appendix/conflict table on page 12 were also rendered and visually inspected.
No claim is made that all page layouts or embedded form details were visually
reviewed. The earlier reported eight-page count is superseded. References were
corrected: BIR discussion is page 4, PhilHealth page 3, source register pages
7–8. Neither PDF is an issuing-agency publication or an independent approval.
The handoff's historical schema description and use of `lastVerified` as a
source-access date do not override the repository's current approval contract.

## Official destinations and evidence

The six public goals and 36 canonical requirements were inspected for source
relationships and destinations. All 19 canonical source destinations were
requested on this pass. Retrieval is not independent verification.

| Source/destination | Observed result and scope |
| --- | --- |
| PSA birth-certificate service | Readable; walk-in appointments and separate ordering channels. Source ID `psa-birth-certificate-service`; requirements 1 |
| SSS Employees | Readable; employee coverage and number issuance are distinct. `sss-employees-coverage`; requirements 3, 31–33, 36 |
| PhilHealth employee registration | Readable; no-PIN versus existing-PIN employee routes. `philhealth-formal-employee-registration`; requirements 4, 34–35 |
| PhilHealth employer reporting | Readable; employer reporting scope. `philhealth-employer-reporting`; requirement 4 |
| NBI how-to and FTJS Charter | Readable; application/branch steps and FTJS checklist. `nbi-clearance-how-to-apply`, `nbi-ftjs-citizens-charter`; requirement 6 and relevant NBI demo prompts |
| BIR 2026 Charter | Readable scoped text, printed pages 2–4 / PDF pages 11–13; hired employees without TIN earning purely compensation income. `bir-citizens-charter-2026`; requirement 2 |
| BIR 2025 checklist | Readable CDR F1102, page 8, July 2025 revision. `bir-cdr-2025`; requirement 2 |
| DFA appointment route | Readable, redirects to `https://www.passport.gov.ph/`; requirement 18 destination improved. Full passport checklist remains unresolved |
| DFA consular pages, LTO homepage | Fetch returned 403; generic fallbacks retained as unverified research leads, not validated specific instructions |
| Pag-IBIG membership page | Tool could not retrieve it; current workflow and destination content remain unconfirmed |
| Official Gazette RA 11261 page | This pass returned 403; prior research history retained, no new legal verification asserted |
| NBI clearance portal, BIR ORUS | Returned titles/empty text bodies; live transactions and procedures not validated |
| Davao health announcement, SSS member/ID pages, PhilHealth formal/services pages, PSA homepage, NBI standard Charter | Destinations returned readable text; no blanket approval. January 2026 health announcement is dated evidence, not current local confirmation |

Exact URLs remain in `src/data/requirementSources.json`; direct comparisons are
recorded separately from the handoff's reported dates. Eight new source records
now have direct check dates and scoped inspection notes. All 19 source records
and all 241 audited civic/catalog records remain unverified. No duplicate IDs
or unresolved canonical references were reported by the data audit.

Remaining content blockers include current Pag-IBIG procedure, passport and
license checklists, local Davao implementation, fee/validity conflicts, and
independent review of First Job claims. The NBI Oath discrepancy remains
explicit. No fixed NBI fee, universal document obligation, or guaranteed service
time was added. Existing conservative public instructions remain pending review.

## Validation results

| Command | Final result |
| --- | --- |
| `npm run check:mvp` | PASS: data/link audits, lint, 182 tests, production build, `MVP_READY`; government gate separately `BLOCKED` |
| `npm test` | PASS: 191 tests, zero failed/skipped; includes nine HTTP integration tests |
| `npm run test:e2e` | PASS: 14 cases across desktop Chromium and mobile Chromium |
| `npm run audit:first-job-release` | Exit 1, `BLOCKED`; unresolved evidence and independent approvals, intentionally unchanged |
| `npm audit --audit-level=moderate` | PASS: zero vulnerabilities |
| `git diff --check` | PASS |

Initial restricted Playwright execution failed with `listen EPERM` on
127.0.0.1:4173. Approved loopback execution worked with the existing configuration;
no Host-header/authority mismatch was reproduced, so host checks were not relaxed.
The first executable suite had eight passes and four failures from stale
assertions; these were fixed. Initial Node runs exposed two stale assertions
about source visibility/search associations, corrected to test the new behavior.
Restricted npm audit failed DNS resolution; approved network access completed it.

Real browser screenshots were inspected for home, goals, and checklist views at
390px and 1440px, including expanded evidence and readable mobile controls.
Automated keyboard/overflow tests cover 320, 375, 768, 1024 and 1440px. The suite
also covers conditional filtering, persistence, browser history, language changes,
external-link attributes, demo safeguards and storage failures. This is not a
complete WCAG certification, native-speaker translation review, or test of live
agency transactions. Chromium only was tested.

## Performance

Baseline production main chunk: **650.20 kB minified / 157.40 kB gzip**.
Final measurements are recorded in the build output; the main chunk is about
227 kB, framework chunk 259.49 kB / 82.40 kB gzip, translations 171.64 kB /
45.20 kB gzip. No chunk exceeds 500 kB. These are separate cacheable chunks,
not proof of lower total initial transfer or faster cold loading; all locales
still load eagerly. Route-level lazy loading was already present and preserved.

## Security, deployment and Git

Authentication, CSRF/origin checks, exact official-host matching and two-person
approval protections remain intact and covered by tests. BIR's exact CDN host is
allowlisted with a lookalike-domain rejection regression. No credential values,
local environment files, SQLite databases, build output or screenshots are part
of this delivery. No new identity-document collection was introduced.

The documented target remains Vercel: static SPA plus `/api/chat`, with deep-link
rewrites. Server-side AI configuration must be supplied privately. The Express/
SQLite admin service remains local/internal; hosted administration still needs
protected persistent storage and operational controls. Browser progress is
local only. No deployment or live AI-provider transaction was performed.

Delivery preserves the existing feature commit and uses a normal merge with
`origin/main` at the confirmed university repository:
`https://github.com/UIC-CCS-WEB-DEVELOPMENT-2026-2027/requisito.git`.
The final chat report records the actual merge commit, push result and clean-tree
check after delivery. No force push or history rewrite is authorized or used.
