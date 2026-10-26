# Government information verification inventory

Inventory date: 2026-10-26. This is a catalog and evidence-structure inventory,
not a claim that every factual statement has been independently researched.

## Scope and counts

The figure **219** is the total number of records counted by the civic/catalog
data audit. It is not the number of government source records. The source
register contains 11 records; 10 are linked to the First Job requirements and
one Davao health-card record is out of scope for that goal.

| Catalog | Records | Verified | Unverified | Conflicting | Missing source URL |
| --- | ---: | ---: | ---: | ---: | ---: |
| Services | 7 | 0 | 7 | 0 | 0 |
| Barangays | 182 | 0 | 182 | 0 | 0 |
| Officials | 3 | 0 | 3 | 0 | 0 |
| City facts | 7 | 0 | 7 | 0 | 1 |
| Updates | 2 | 0 | 2 | 0 | 0 |
| History | 0 | 0 | 0 | 0 | 0 |
| Budget | 0 | 0 | 0 | 0 | 0 |
| Procurement | 0 | 0 | 0 | 0 | 0 |
| Briefs | 3 | 0 | 3 | 0 | 0 |
| Elections | 1 | 0 | 1 | 0 | 0 |
| Accountability | 0 | 0 | 0 | 0 | 0 |
| Requirements | 14 | 0 | 14 | 0 | 0 |
| **Audited total** | **219** | **0** | **219** | **0** | **1** |

Every one of the 219 catalog records is currently unverified and has no
`lastVerified` date. This is the expected state for unapproved records, not
evidence that 219 records have been reviewed. The separate
`src/data/requirementSources.json` register has 10 records: 0 verified, 10
unverified, 0 conflicting, and 0 missing source URLs. Its `lastChecked` dates
record source-access attempts; they do not grant verification.

The 14 canonical requirements include six associated with First Job. All six
and all ten linked source records remain unverified. The First Job catalog
keeps employer-dependent items conditional and describes SSS and PhilHealth
only to the limited extent supported by the sources recorded in the research
queue. The Pag-IBIG, BIR, PSA, and NBI procedures are not asserted as
confirmed. No separate barangay-certification checklist item is currently
published as a universal job requirement.

## Evidence and access limitations

- The SSS member page was accessible and supported only the flow details
  recorded in its evidence entry. It does not establish a universal document
  checklist, application fee, or employer-specific deadline.
- PhilHealth's formal-economy page supports the employee-employer
  direct-contributor classification. Its linked member-category page gives
  more worker categories; neither page provides first-time enrollment steps.
- The NBI Citizen's Charter page supports limited claims about its listed
  service paths and two-ID instruction. Its date, current fee schedule, and
  Davao applicability remain unconfirmed; the separate NBI application portal
  is only a shell.
- The Pag-IBIG page presented an access challenge. The attempted PSA URL failed
  at the transport/DNS layer; neither outcome substantiates the underlying
  process.
- BIR ORUS returned an application shell without first-time employee TIN
  guidance. It is a destination lead only.
- The Official Gazette RA 11261 article page was accessible on 2026-10-26 and
  links the official PDF. The PDF text itself was not extracted or reviewed.
  Detailed section wording was cross-checked only against Lawphil, a
  non-government transcription; the statutory claims remain unsupported by
  directly inspected official text pending independent review.
- A Supreme Court e-library URL that resolved to an unrelated 1974 issuance
  was rejected and is not evidence for RA 11261.
- The Davao City health-card announcement is dated historical material. It
  does not establish current applicability, procedures, fees, location, or
  schedules for a first-time jobseeker.

See [the requirements research queue](./requirements-research-queue.md) for
record-level claims, source URLs, limitations, and follow-up research. No
independent human review is claimed in this inventory.

## Audit controls

`npm run check` validates source structure, HTTPS and allowed official hosts,
date syntax, source links, verification consistency, and review evidence.
Verified records must carry the independent review request ID, pseudonymous
reviewer ID, source-access date, review date, and a substantive note. A
requirement must link at least one existing source record. The claim-level
review of a requirement is distinct from the editorial review state of its
source-register entries. Source review dates older than 365 days fail the data
audit.

These automated controls do not establish factual accuracy, confirm that a
URL is live, or replace an independent human's comparison of each claim with
the cited source. The one city fact without a source URL must remain
unverified until a source is added and reviewed.

The `requirementSources` register is managed through the database import,
review, edit, and export workflow. Exact official hosts used by the reviewed
First Job source records are admitted by the source allowlist. Lifecycle tests
cover review and export while preserving source identity. All 11 entries
remain unverified; workflow availability does not constitute approval.

## Publication status

- **Fully verified:** 0 of 219 audited records; 0 of 11 source-register
  records.
- **First Job evidence:** six claim packages exist; one has complete evidence
  only for limited SSS claims, and five lack sufficient evidence. Zero
  requirements or linked sources are independently approved. The release
  gate reports one requirement pending approval and five blocked.
- **Awaiting independent review:** all 219 audited records and all 11 source
  records.
- **Corrected/withheld:** unsupported First Job procedure, fee, deadline,
  and office claims remain qualified or absent rather than being presented as
  confirmed.
- **Broken or inaccessible in the recorded research:** the Pag-IBIG access
  challenge, PSA transport/DNS failure, and the limited NBI application shell
  are blockers to evidence review, not proof that agencies or services are
  unavailable.
- **Production/publication blocker:** authoritative evidence and the required
  independent human review have not been completed. Requisito must not present
  these records as verified.

The release gate is `npm run audit:first-job-release`. It returns a nonzero
exit while the result is `BLOCKED` or `PENDING`; this is expected until every
included claim, linked source, legal disclaimer, and independent approval
satisfies the gate. The `EXCLUDED` disposition is explicit and is never
counted as verified.
