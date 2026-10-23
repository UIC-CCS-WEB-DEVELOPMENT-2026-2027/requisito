# TLA Dynamic Data Evidence

## Objective-to-code map

| Sprint objective | Evidence |
| --- | --- |
| Local JSON dataset and data flow | `src/data/services.json`; `getServices()` in `src/data/helpers.js` returns catalog copies for the page. |
| Render records from data with stable keys and props | `Services` in `src/pages/Services.jsx` maps visible records using `service.id`; `ServiceCard` in `src/components/ServiceCard.jsx` receives each record through its `service` prop. |
| Search, category filter, and ordering | `filterServices()` and `sortServices()` in `src/utils/serviceFilters.js`; controlled inputs and derived list in `Services`. |
| Filter/sort regression tests | `src/tests/serviceFilters.test.js` covers search match/no match/whitespace, category, each ordering, non-mutation, and combined filtering and sorting. |
| Public live demonstration | `/services` is a public route in `src/App.jsx` and does not use `ProtectedRoute`. |
| Existing data contract | The service fields and stable IDs/slugs are documented in `docs/data-contract.md`; the JSON service records remain unchanged. |

## Data flow

The existing source is the service JSON catalog, not a new mock dataset. The
data path is `src/data/services.json` → `getServices()` in
`src/data/helpers.js` → `Services` in `src/pages/Services.jsx` →
`ServiceCard` through props. The Services page derives category options from
the catalog and derives its visible list from the current search, category,
and sort state.

## Screenshots checklist

### Git evidence

Run these commands from the repository root:

```sh
git log --oneline -15
git ls-files src/data src/pages src/components
```

Capture the VS Code window with the terminal output and Explorer/editor visible
together. Keep `src/data/services.json`, `src/pages/Services.jsx`, and
`src/components/ServiceCard.jsx` visible in the file tree or editor.

### Live evidence

Open `/services` in the browser. Enter `health` in Search services, choose
`Health` in Category, and change Sort services between Verification status,
Time-sensitive first, and A to Z. Capture the page with the controls, live
result count, and service cards visible. For the empty-state screenshot, search
for a phrase that is not in the catalog; the page should show “No records
found”, a suggestion, and a Clear filters button.

## Push and submit

The remote URL and current branch were not inspected here. Before submitting,
run `git remote -v` and confirm the actual team remote. After creating the
feature branch and commits, the requested push command is:

```sh
git push -u origin feature/tla-dynamic-data
```

Use the repository URL shown by `git remote -v` for the repository link. The
branch URL is `<repository-url>/tree/feature/tla-dynamic-data`; the commit URL
is `<repository-url>/commit/<commit-sha>`. Copy the real URLs after the branch
and commit are available, then submit them with the screenshots in Google
Classroom.
