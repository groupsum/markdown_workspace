# Renderer basic example reference

## Purpose

This example validates the public renderer package surface outside the main workspace app.

## Demonstrated surfaces

- CommonMark core rendering
- GFM tables, task lists, strikethrough, and autolink literals
- optional extension rendering for definition lists, math, and footnotes
- public theme-style helper usage

## Public packages exercised

- `@mdwrk/markdown-renderer-react`
- `@mdwrk/ui-tokens`

## Boundary note

This example intentionally does **not** import private `apps/client/*` wiring.
It is a public-surface example only.
