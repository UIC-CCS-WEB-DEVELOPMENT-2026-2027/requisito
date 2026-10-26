# Requirements research queue

Status reflects official-source checks completed through 2026-10-26. A blocked or
unavailable page is a research lead, not evidence for a requirement. Do not
publish a claim as verified until its source evidence has passed the existing
two-person review.

For catalog counts and a separation of the 219 audited civic/catalog records
from the 10 First Job-linked source records (11 source records overall), see the
[government verification inventory](./government-verification-inventory.md).

| Priority | Goal or service | Current evidence | Remaining research |
| --- | --- | --- | --- |
| 1 | First-job readiness | On 2026-10-26, official SSS pages supported the limited online/branch E-Center number-application flow and SSS ID hierarchy claims recorded in the evidence packages. PhilHealth's formal-members page supports direct-contributor classification for workers with an employee-employer relationship, not first-time enrollment. The NBI Citizen's Charter page supports its listed two-ID and walk-in/online service options, but its date, current fees, and Davao applicability were not established; the separate clearance portal is only a shell. BIR ORUS remains an application shell. The Official Gazette RA 11261 article confirms the Act's title/signing date and links a PDF, but its PDF text was not extracted or reviewed; section wording was cross-checked only against Lawphil, a non-government transcription. All records remain unverified pending independent review. | Confirm current NBI applicant categories, requirements, fees, processing, and Davao office details; Pag-IBIG registration and employee applicability; BIR's first-time employee TIN route and employer responsibilities; and the valid PSA request URL and current request process. Review the official RA 11261 PDF and confirm amendments, implementation, barangay certification, and eligible transactions. PhilHealth first-time enrollment steps and employer/applicant responsibilities remain unconfirmed. No unsupported fee, deadline, office, or processing claim is published. |
| 2 | Philippine passport | No current passport requirements are published in the catalog. An attempted official DFA requirements URL returned 404. | Find the current DFA page or issuance for first-time adult applicants, minors, and renewals. Verify categories, documents, appointment channels, fees, and exceptions independently. |
| 3 | Driver permits and licenses | No LTO process is published in the catalog. Attempted official LTO pages returned HTTP 403. | Obtain accessible current LTO evidence for student permits, non-professional and professional licenses, and renewals. Confirm prerequisites and category-specific steps before adding requirements. |
| 4 | Civil registry documents | No current PSA or Local Civil Registrar process is published in the catalog. | Research birth, marriage, and other priority certificates using current PSA and applicable local-government sources; distinguish issuance channels and authorized representatives. |
| 5 | NBI and police clearances | No current national or local clearance procedure is published in the catalog. | Research NBI clearance from an official NBI source and local police clearance from the relevant Davao police/city source. Keep national and local processes distinct. |
| 6 | Davao City services | The City Information Office / City Health Office announcement “Health card issuance starts January 7” reports that the City Health Office would issue cards beginning January 7, 2026, and quotes a city official saying employees must have a health card under a city ordinance. It lists categories and reported documents/fees. The page was accessible and checked 2026-10-25, but its requirements are historical, unverified, and not included in the First Job goal. | Confirm with the City Health Office whether the ordinance and categories remain in force and which current occupations, requirements, fees, venue, schedule, accepted formats, and steps apply. Do not imply every current first-job applicant needs a card based on this dated announcement alone. |
| 7 | Scholarships, internships, and education | No current institution-specific application requirements are published in the catalog. | Select high-impact local and national programs, then research each program's official current call for applications. Keep institution-specific requirements scoped to that program and intake. |
| 8 | Other government registrations and transactions | The SSS FAQ at `https://www.sss.gov.ph/become-an-sss-member/` and BIR ORUS application shell at `https://orus.bir.gov.ph/` were accessible; other guessed SSS number URLs returned 404 and were not used as evidence. Pag-IBIG membership pages presented an access challenge. The BIR shell contains no visible employee TIN instructions. | Use accessible primary agency pages or issuances. Record failures as research limitations, not evidence for requirements. |

## Research and publication checklist

For each candidate requirement, record the responsible agency, exact official
source title and URL, publication/issuance/effective dates when available,
date checked, exact supported fields, applicant category, conditions,
verification status, and unresolved questions. Keep unsupported fees,
deadlines, processing times, locations, office hours, and URLs out of
instructions. If a source cannot be accessed or is historical, leave the
affected claim unverified and state what still needs confirmation.

Add evidence to `src/data/requirementSources.json`, link a canonical
requirement ID to every applicable goal, and update the review through the
local two-person workflow. See [the requirements-flow guide](./requirements-flow.md)
for catalog and test procedures.

## First-job status after the 2026-10-26 source check

- Birth certificate, TIN, and NBI items remain employer-request dependent. The
  First Time Jobseekers Assistance Act is presented as a possible one-time
  government-fee waiver only for eligible applicants who meet the Act's proof
  conditions; it is not a promise of free processing or a universal requirement.
- TIN is now conditional on an employer asking for TIN details or registration,
  not merely on an employment relationship. Its BIR procedure remains unknown.
- Pag-IBIG is a recommended confirmation prompt, not a request to register,
  pay, or create a number. Its applicability and first-time process were not
  established by accessible official evidence.
- The SSS member page now documents the online number-application flow and
  branch E-Center option, the requested information categories, a five-day
  email continuation link, optional supporting-document upload, and employer
  reporting effective on the first day of employment. The separate SSS ID page
  is not presented as a universal upload checklist. The application fee and
  employer-specific onboarding deadline are not stated. Confirm prior-member
  handling directly with SSS. Both SSS source records remain unverified.
- PhilHealth's formal-economy page and its linked member-category page were
  checked on 2026-10-26. The formal page states that government and private
  workers with established employee-employer relations qualify under the
  program; the member-category page describes government employees, private
  employees, and other workers rendering services. The pages do not establish
  first-time enrollment steps, required documents, timing, or who files. The
  source and requirement remain unverified pending independent review.
- No evidence in this review establishes a general Davao health-card
  requirement for first-job applicants.
- The NBI Citizen's Charter page supplies limited service information, but
  current fees, Davao office applicability, and publication approval remain
  unresolved. The separate NBI portal and BIR ORUS are landing shells only;
  no current transaction instructions are inferred from them.
- The Pag-IBIG membership page presented a browser-verification challenge.
  The PSA civil-registry URL could not be fetched. Both entries remain
  unverified research leads with no invented procedure.
- The Official Gazette RA 11261 article page is accessible and links the PDF.
  The PDF text itself was not extracted or reviewed; detailed section claims
  remain based on a secondary transcription until an independent reviewer
  checks the official text and current implementation.
- BIR's official site could not be retrieved during this check; ORUS returned
  only an application shell. PSA process pages and CRS also failed at the
  transport/DNS layer; PSA Serbilis returned an online-service application
  shell, not a government procedure or proof of its current authorized scope.
  Pag-IBIG pages returned a browser-verification challenge. These results
  support only the recorded access limitations, not any procedural claim.
- All six requirement-specific evidence packages are in
  `src/data/firstJobEvidence.json`. The source catalog now participates in
  admin import, review, and export, but the packages remain blocked or pending;
  no independent approval has been recorded. Run
  `npm run audit:first-job-release` to see the release disposition. A nonzero
  exit is expected until evidence gaps and independent approvals are resolved.
