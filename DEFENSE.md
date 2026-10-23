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
