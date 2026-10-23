# Davao data sources

Every current catalog record is unverified. These links are source leads supplied
for the prototype, not proof that a fact is current. Confirm the exact statement
on the source page before changing verification metadata.

| Source URL | Supports / review note |
| --- | --- |
| https://davaocity.gov.ph/departments/social-services/central-911/ | Central 911 service listing; confirm contact numbers, address, and current availability. |
| https://www.davaocity.gov.ph/?p=20222 | Additional Central 911 source cited in the seed; confirm current details. |
| https://hrmo.davaocity.gov.ph/launching-of-the-davao-city-contact-center-dccc/ | Davao City Contact Center launch and reported number; current status must be checked. |
| https://davaocity.gov.ph/departments/public-administration/cmo-public-information-production/ | City Information Office contact details. |
| https://davaocity.gov.ph/business-bureau/ | Business Bureau contact and business-permit information; deadlines and systems may change. Also supplied as a lead for administrative district names; confirm against an official district list. |
| https://davaocity.gov.ph/uncategorized/davao-city-to-continue-hybrid-processing-for-one-stop-shop-renewal-of-mayors-permit-for-2023/ | Historical 2023 City Treasurer / permit-processing announcement; not current guidance. |
| https://www.davaocity.gov.ph/?p=2412 | City Health Office contact and service information. |
| https://davaocity.gov.ph/health/health-card-issuance-starts-january-7/ | January 2026 health-card venue, requirements, fee, and schedule claims; confirm with the City Health Office. |
| https://www.davaocity.gov.ph/?p=17203 | Earlier health-card schedule; historical only and requires current confirmation. |
| https://rsso11.psa.gov.ph/content/population-davao-city-based-results-2015-census-population | PSA 2015 census source for city status/region and the cited barangay count. Confirm every claim on the source page. |
| https://davaocity.gov.ph/ | Official city website starting point for confirming the listed city offices; no office holder is asserted in the data. |
| https://comelec.gov.ph | COMELEC official-site link for current voter-registration, election-date, and polling-place information; project link is unverified. |

The three civic briefs reuse source URLs already listed above. The health-card
brief uses the health-card announcements, the business-permit brief uses the
Business Bureau page, and the emergency brief uses Central 911 and the Contact
Center source.

No official Davao budget or PhilGEPS procurement CSV has been supplied. The
import scripts accept HTTPS source URLs per row but do not locate, fetch, or
verify source data. The history and accountability catalogs remain empty until
dated, sourced entries or official documents are provided.

The supplied 2020 population and land-area numbers have no official URL yet and
remain unverified with an empty `sourceUrl`. They need the relevant PSA page.
Administrative and legislative district counts need official confirmation.

For the complete record-to-source mapping see
[`src/data/services.json`](../src/data/services.json),
[`src/data/requirements.json`](../src/data/requirements.json),
[`src/data/cityFacts.json`](../src/data/cityFacts.json),
[`src/data/updates.json`](../src/data/updates.json), and
[`src/data/officials.json`](../src/data/officials.json).
Part 2 adds [`src/data/briefs.json`](../src/data/briefs.json),
[`src/data/elections.json`](../src/data/elections.json), and empty
[`src/data/history.json`](../src/data/history.json),
[`src/data/budget.json`](../src/data/budget.json),
[`src/data/procurement.json`](../src/data/procurement.json), and
[`src/data/accountability.json`](../src/data/accountability.json).
