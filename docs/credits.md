# Credits

The October 2026 UI redesign follows the local
[BetterSolano.org](https://bettersolano.org/) reference by Ramon Logan Jr.
Its compact header, grouped dropdowns, split hero and search panel, resource
cards, service-detail sidebar, and grouped footer were reimplemented in
Requisito's React and CSS stack with a white, green, and red Davao palette.
The reference source was inspected in `bettersolano/index.html` and
`bettersolano/assets/css/{style,responsive,footer}.css`. Requisito retains its
own content, routes, data, icons, authentication, and integrations. No Solano
datasets, images, branding, analytics, or credentials were imported.
The upstream license is retained in
[`licenses/BetterSolano-LICENSE.txt`](../licenses/BetterSolano-LICENSE.txt).

Requisito was informed by the civic-information and citizen-first design work
in [BetterMakati](https://github.com/migi-macati/bettermakati) and its
Better Local Gov starter-kit materials
([starter-kit guide](https://github.com/migi-macati/bettermakati/blob/main/STARTER-KIT-README.md)).

The inspiration includes service and hotline directories, barangay profiles,
source-linked facts and updates, search, source status, and a contribution
journey. These patterns were independently implemented using Requisito's
existing React, React Router, JavaScript, and plain CSS stack.

Part 2 also reimplements patterns for source freshness monitoring, timelines,
budget and procurement tables, civic briefs, a local-data monitor, election
links, an official-document ledger, participation guidance, and integrity
disclosures. Reference features requiring unavailable data or backend
capabilities are documented with reasons in
[`parity-matrix.md`](./parity-matrix.md).

No source file was borrowed from the reference repository. No Makati-specific
content, logos, images, or branding were copied. The reference checkout was
read-only and remains untouched.

The Davao barangay names and administrative district assignments were compiled
from a public encyclopedia list as a pointer only. They are not an official
source and must be checked against the PSA workbook and the city's official
district list before verification.
