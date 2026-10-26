# Route and link audit

## Sources of truth

- `src/routeManifest.js` is the public route manifest. Each route has a stable
  ID, path pattern, page component, access level, and optional navigation or
  footer placement. `adminRoutes` records the separate local admin paths.
- `href(routeId, params, query)` formats internal links from manifest IDs and
  throws for unknown routes or missing dynamic parameters.
- `routeMatches(pathname)` resolves concrete public paths against the same
  manifest. The link checker also recognizes the separate admin routes.
- `Layout` and `Footer` render their navigation from manifest entries.

## Automated checks

Run:

```sh
npm run audit:links
node --test scripts/route-manifest.test.mjs scripts/route-smoke.test.mjs scripts/audit-links.test.mjs
```

`scripts/audit-links.mjs` parses every JSX file under `src/` and checks local
link destinations, literal route-helper IDs, in-page anchors, allowlisted
static external hosts, new-tab `rel` attributes, input labels, button types and
accessible names, empty click handlers, and image alt attributes. The civic
data audit separately checks source records and the feature-catalog arrays.
Dynamic record URLs are checked when rendered and retain their record's
unverified status; they are never treated as confirmed facts.

`scripts/route-smoke.test.mjs` renders public manifest entries through the
actual React Router app using server-side rendering and real sample slugs from
the supplied services, barangays, districts, and officials catalogs. It checks
that each rendered page has exactly one `h1` and the shared `main-content`
landmark. The `/questions` route is a redirect, and the three signed-in
prototype routes are protected; they are not counted as ordinary public-page
renders. Dynamic report detail paths are tested with an unpublished slug so
the honest not-found state is covered without inventing report data.

The route smoke test runs inside Node with Vite's module loader; it does not
start or bind a development or preview server. It does not make a provider or
other network request. Visual and keyboard checks at 360px and desktop still
require a manual browser walkthrough.

## Accessibility lint note

The project uses ESLint 10. The attempted install of `eslint-plugin-jsx-a11y`
was rejected by npm because its current release declares peer support only
through ESLint 9. No force or legacy-peer-dependency override was used, and no
package dependency was added. The standalone AST audit covers the concrete
link and control checks above; `npm run lint` remains the project's normal
ESLint validation.
