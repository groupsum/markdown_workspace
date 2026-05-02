---
title: Backstory: Client Split-Out
slug: history/client-split-out-background
section: History
sectionOrder: 5
order: 1
toc: true
date: 2025-12-12
status: published
---
Back-dated note: December 12, 2025.

## What changed

The repository stopped treating the editor and preview implementation as one app-private surface and split them into reusable package families:

- `@mdwrk/markdown-editor-core`
- `@mdwrk/markdown-editor-react`
- `@mdwrk/markdown-renderer-core`
- `@mdwrk/markdown-renderer-react`

## Why the split mattered

The split-out made it possible to:

- keep client integration logic in `@mdwrk/mdwrkspace`
- reuse the same packages in examples and documentation
- define stable public package boundaries
- let themes and extensions target the same public contracts

## Documentation rule

Once the split happened, the lander should have documented the client and package surfaces, not the lander itself.
