# Goal and checklist coverage audit

Audited against the goal and requirement catalogs on 2026-10-25. This is an
implementation and evidence-status inventory, not a claim that any civic
requirement has completed the independent review process.

## Coverage summary

| Goal ID | Goal | Canonical requirements | Checklist outcome | Evidence and conditions | Navigation and gaps |
| --- | --- | --- | --- | --- | --- |
| 1 | First Job | IDs 1–6 resolve; no duplicate or missing IDs | Available; unanswered conditional items remain listed and answers filter them | Four conditional items have goal-specific questions; two are recommended. Linked sources are the [First Time Jobseekers Assistance Act](https://www.officialgazette.gov.ph/2019/04/10/republic-act-no-11261/), [SSS membership FAQ](https://www.sss.gov.ph/become-an-sss-member/), and [PhilHealth Formal Economy Members](https://www.philhealth.gov.ph/members/formal/) plus [PhilHealth Online Services](https://www.philhealth.gov.ph/services/). All remain unverified. The Pag-IBIG guide has no source and explicitly says its process is unknown. | Goal detail starts `/checklist?goal=1`; each item links to its canonical guide with `goal=1&from=checklist`; the guide returns to that checklist. BIR, NBI, PSA, SSS and PhilHealth implementation details remain incomplete where stated in the guides. |
| 2 | Passport | None linked | Not available; the page says research is pending and does not create requirements | No passport source or requirement records are linked to this goal. | Goal detail opens its availability state at `/checklist?goal=2`. General document guides are explicitly not represented as passport requirements. |
| 3 | NBI Clearance | None linked | Not available as a standalone NBI goal | NBI clearance appears only as an employer-dependent First Job requirement (ID 6); this is not evidence of the general NBI process. No standalone NBI goal source is linked. | Goal detail opens `/checklist?goal=3`; no general NBI application checklist is inferred from the First Job item. |
| 4 | Driver's License | None linked | Not available; no placeholder license requirements are generated | No license requirements or sources are linked. | Goal detail opens `/checklist?goal=4`; the page presents the pending research state. |
| 5 | SSS and PhilHealth | None linked | Not available as a combined registration goal | SSS and PhilHealth records are linked only to First Job (IDs 3–4). Their specific guidance does not establish that those procedures apply to this separate goal. | Goal detail opens `/checklist?goal=5`; the UI does not reuse the First Job checklist or imply equivalent applicability. |
| 7 | Davao City Health Card | IDs 7–14 resolve; no duplicate or missing IDs | Available, based on a dated city announcement; unanswered conditions stay listed until answered | Eight requirements link to the Davao City Information Office / City Health Office announcement, [“Health card issuance starts January 7”](https://davaocity.gov.ph/health/health-card-issuance-starts-january-7/). It remains unverified and does not confirm current applicability. Food-industry and body-fluid items are conditional; all eight have guides. | Goal detail starts `/checklist?goal=7`; guide links preserve that ID and return path. Current requirements, eligibility, fees, location, and application process remain unresolved as recorded in the data. |

## Findings and implementation behavior

- The sample goal (ID 6) is excluded from public goals and does not count as
  civic-service coverage.
- Every linked ID for the two available checklists resolves to a canonical
  requirement with a guide and valid source references where source IDs are
  present. Requirements and sources are still marked `unverified`; no content
  was promoted to verified by this audit.
- `goals[].requirementIds` remains the checklist membership source. The
  `goalId` on requirement records is checked as the primary goal mapping.
  Duplicate references are removed before planning and called out by tests.
- Planning answers and progress share the existing
  `requisito.checklist-progress.v1` browser-local store, partitioned by stable
  goal ID. Conditional answers are persisted alongside item status so refresh
  and guide navigation do not silently change the checklist.
- An unavailable checklist explains that research and review are pending,
  links to general document guides with an explicit non-substitution warning,
  and returns the visitor to the goal catalog. The guides are not presented as
  applicable to that goal.
- Unknown or malformed goal IDs show the generic no-checklist state and a
  route back to Goals. Invalid requirement references are reported by planning
  warnings and data integrity tests rather than treated as sourced steps.

## Recommended research work

Research Passport, standalone NBI Clearance, driver's licensing, and SSS /
PhilHealth registration independently before adding canonical requirement
records. Confirm primary agency guidance, applicant categories and current
procedures; leave fees, timelines, document lists, and eligibility unknown
until the source evidence supports them. Continue the required independent
civic review before changing any verification status.
