# Editor basic example reference

## Purpose

This example validates the public editor and renderer package surfaces outside the main workspace app.

## Demonstrated surfaces

- list continuation
- task list insertion
- line numbers
- theme support via public theme-style helpers
- optional profile toggles for definition lists, math, and footnotes

## Public packages exercised

- `@mdwrk/markdown-editor-react`
- `@mdwrk/markdown-renderer-react`
- `@mdwrk/ui-tokens`

## Boundary note

This example intentionally does **not** import private `apps/client/*` wiring.
It is a public-surface example only.
