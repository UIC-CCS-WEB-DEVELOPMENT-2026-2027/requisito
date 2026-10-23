# Data refresh procedure

## Reviewing a source

1. Open the official source and confirm it supports the exact record fields.
2. Check whether dates, contacts, fees, venues, requirements, and schedules are
   still current.
3. Edit the appropriate JSON record in `src/data`; keep an empty `sourceUrl` if
   no supporting source is available.
4. Keep `verification: "unverified"` and `lastVerified: null` until the local
   admin workflow records a two-person review. One reviewer submits an
   official HTTPS source, access date, and comparison note; a different
   reviewer or admin approves it. The approval date is recorded in the
   `Asia/Manila` time zone.
5. Run `npm run check`. The audit reports but never changes data.

Never treat a URL or a successful build as proof of accuracy. Do not turn a
sample barangay into a real record by changing its label. Do not directly set
`verification` to `verified` in a JSON file. Local admin edits and approvals
remain in SQLite until the maintainer explicitly runs `npm run db:export`;
exports are staged and audited before catalog files are replaced.

## Local admin review and export

Set up the local admin API by following [docs/admin-runbook.md](admin-runbook.md).
The first account is created interactively; no default or seeded accounts are
provided. Reviewers must compare the exact fields against the cited official
source, then submit a request with the access date and a concise comparison
note. A different reviewer/admin approves or rejects it. Editing the record
resets a previous verification and cancels pending requests for that record.

The database is the local review workspace, not a public data source. After
reviewing approved edits, run `npm run db:export`; the exporter refuses missing
catalog records or data-audit failures. Run `npm run check` afterward and
inspect the resulting catalog diff before sharing or deploying the public
site. Re-running `npm run db:import` is safe for existing database rows: it
adds missing catalog rows but does not overwrite reviewed local records.

## Importing barangays

The checked-in CSV contains the 182 names and districts compiled from a
secondary encyclopedia list, not from the PSA workbook. Check the list against
the PSA workbook and the city's official district list before treating those
names or district assignments as authoritative. Populations are intentionally
blank until sourced from the PSA table. The CSV uses these exact columns and
header order:

```text
name,adminDistrict,legislativeDistrict,population2020,sourceUrl
```

Administrative and legislative districts must match the known district mapping.
Population values may be blank; a nonblank value must be a non-negative whole
number. The source URL points to a PSA workbook but does not prove the names or
districts have been verified.

Run:

```sh
node scripts/import-barangays.mjs
npm run check
```

The importer writes every row as unverified, with a null verification date and
`isSample: false`. It rejects malformed rows, duplicate names, unknown districts,
and district mismatches. Slug collisions are warned about and resolved with a
numeric suffix. It prints the imported total, counts by district, and blank
population count. Keep the source CSV available to the maintainer.

### Merge 2020 populations

1. Download the official PSA workbook and open the City of Davao table.
2. Save that sheet as `data-source/psa-davao-population.csv` with exactly the
   columns `name,population2020`.
3. Run the default dry run:

```sh
node scripts/merge-population.mjs
```

4. Read the matched and unmatched lists and resolve naming differences manually;
   the script never fuzzy-matches.
5. Only after the report is correct, write with:

```sh
node scripts/merge-population.mjs --write
```

The default command only prints a report. `--write` writes only when all 182
barangays match exactly once. Use `--allow-partial` only when intentionally
writing matched values; unmatched populations remain `null`. The report
displays the matched population sum and its difference from the official 2020
City of Davao total. The merge does not modify verification states or dates.

## Importing budget and procurement records

Obtain data directly from an official Davao City budget publication and
PhilGEPS or an official agency procurement publication. Save CSVs with these
exact headers:

```text
data-source/davao-budget.csv:
fiscalYear,sector,amountPHP,sourceUrl

data-source/davao-procurement.csv:
referenceNo,title,agency,amountPHP,awardDate,status,sourceUrl
```

Then run:

```sh
node scripts/import-budget.mjs
node scripts/import-procurement.mjs
npm run check
```

Importers reject malformed headers, negative/non-finite amounts, invalid years
or dates, missing required text, duplicate row keys, and non-HTTPS source URLs.
Every imported record remains unverified with `lastVerified: null`. No sample
amounts, contracts, or awards are included.

## Source watch

`data/watchlist.json` contains deduplicated `.gov.ph` source links already
present in the seed catalogs. First preview the request list:

```sh
node scripts/source-watch.mjs --dry-run
```

To fetch sources manually, run `node scripts/source-watch.mjs`; optionally use
`--timeout 20` to set the per-page timeout in seconds. It fetches sequentially
with a one-second pause, writes `docs/source-watch-report.md`, and records
content hashes plus the report date in `data/source-watch-state.json`.
Review each changed or unreachable result and re-check the cited official pages
yourself. Source-watch never edits catalog records or sets `lastVerified`.
The workflow in `.github/workflows/source-watch.yml` is scheduled and manual,
but was not run by this implementation.

History entries, COMELEC source pages beyond the official-site link, and any
accountability documents must be supplied with their source and dates. Source
links remain unverified until a second reviewer has completed the independent
approval workflow.
