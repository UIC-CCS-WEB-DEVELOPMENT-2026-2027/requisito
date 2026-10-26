# TLA Defense Note

## State and updates

On the public Services page, `query` holds the search text, `category` holds the
selected service category, and `sortMode` holds the selected ordering. Each
state value changes when its labeled input or select fires `onChange`; React
then renders the filtered and sorted list again. The service records themselves
come from the existing JSON catalog through `getServices()` and are not edited
by the controls.

## Props and cards

The Services page passes one service record to each `ServiceCard` as the
`service` prop. The card uses that record to show its category, title,
description, time-sensitive note, and source metadata. It does not import or
read the catalog, so the page owns data selection and each child only presents
the data it receives.

## List keys

The Services list uses `key={service.id}` because every catalog record already
has a stable unique ID. React uses that key to match a card to the same service
when filtering or sorting changes the order. An array index is a poor key
because its value changes when items are filtered or moved, which can make React
reuse the wrong row state.

## Filtering and sorting

`filterServices` trims and lowercases the search text and returns services whose
title or description contains it, optionally matching the selected category.
It uses `.filter()`, so the imported list is not changed. `sortServices` first
copies its input with `[...services]` and sorts that copy by verification
status, time sensitivity, or title; it never sorts the original catalog in
place.

## Controlled inputs and empty queries

The search input and both selects are controlled because their `value` comes
from React state and their `onChange` handlers update that state. This keeps
what the user sees in each control aligned with the values used to derive the
visible list. A query containing only spaces trims to an empty string, so it
does not exclude any service.

## Part 6 route and civic data defense

The public route list is in `src/routeManifest.js`. The `id` is the route's
stable name, and `href()` builds its path from that name plus any required
parameters. `Layout` and `Footer` render their links from the manifest, so a
path change has one shared source. The link audit parses JSX and checks that
internal paths still match a route, that buttons and inputs have accessible
names or labels, and that external new-tab links have safe `rel` attributes.

I added `src/data/featureCatalogs.json` with explicit arrays for the civic
features that do not yet have supported Davao records. Those arrays are empty
on purpose: an empty catalog is safer and more honest than made-up records.
The feature pages still explain the data gap and link to related source leads
when the existing service catalog provides one. A source link is labeled
unverified; it does not mean Requisito has checked the page or its facts.

The guide finder has one piece of `useState`: `category` holds the selected
category, and its change handler updates that value. `getVerifiedGuides()` uses
`.filter()` to include only complete briefs that are already marked verified
and have an HTTPS source. The current brief records are unverified, so the
finder correctly shows an empty state. `GuideCard` receives a single `guide`
prop from the finder and does not import the data itself. The list key is the
stable guide `id`, not a changing list position.

The header assistant button uses `assistantOpen` state in `Layout` to open and
close the native dialog. `ChatAssistant` keeps the transcript, input, loading,
and error text in local React state; it does not persist the conversation.
Native `<dialog>` supplies modal keyboard and Escape behavior, and the open
button exposes its expanded state. A service detail page may provide a stable
service slug as context, but the server looks that slug up itself and still
applies its verified-only rule. The selected interface language is validated
before it reaches the provider.

The route smoke test renders public manifest routes with Vite's server-side
module loader and checks for one `h1` and the shared main landmark. It does not
start a web server or make a real AI request. A green test checks UI structure
and code behavior only; it does not verify any Davao civic fact or replace a
manual keyboard and 360px browser review.
