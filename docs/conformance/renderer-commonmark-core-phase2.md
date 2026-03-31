# Renderer CommonMark-core Phase 2 checkpoint

Date: 2026-03-27

## What this checkpoint closes

This checkpoint closes a **real Phase 2 renderer implementation lane** for the current v2 repository.

It adds or hardens:

- block/inline parsing through a portable internal renderer engine
- heading extraction from the internal AST
- paragraphs and thematic breaks
- ATX and Setext headings
- block quotes
- ordered and unordered lists, including task-list detection used by the current product profile
- indented and fenced code blocks with info strings
- code spans
- emphasis and strong emphasis
- inline links, reference links, link definitions, autolinks, and images
- backslash escapes and basic entity/numeric character decoding
- policy-controlled raw HTML handling
- source-position attributes for rendered output when requested

## Renderer package versions in this checkpoint

- `@mdwrk/markdown-renderer-core` — `1.1.0`
- `@mdwrk/markdown-renderer-react` — `1.1.0`

## Evidence captured here

### Executable renderer lane
`npm run test:renderer` now passes in the checkpoint zip.

### CommonMark-core subset harness
The current official-seeded CommonMark-core subset harness passed:

- **20 / 20**

The machine-readable results live at:

- `artifacts/conformance/latest/phase-2-commonmark-subset-results.json`

### Golden artifacts
The checkpoint now includes committed golden renderer artifacts for the Phase 2 sample document:

- `packages/renderer/markdown-renderer-core/tests/golden/commonmark-phase2-sample.ast.json`
- `packages/renderer/markdown-renderer-core/tests/golden/commonmark-phase2-sample.html`

## Important limits

This checkpoint is **not yet final strict conformance**.

It still does **not** prove:

- full CommonMark 0.31.2 example-by-example closure
- full default GFM closure
- full optional-profile closure
- full app-shell preview/adapter parity closure

## Raw HTML policy in this checkpoint

Raw HTML is now **policy-controlled**.

- `htmlHandling: "escape"` renders HTML tags as escaped text
- `htmlHandling: "allow-trusted"` emits raw HTML inline/block content

This is consistent with the Phase 0 requirement that raw HTML handling be explicit, not incidental.

## Why this matters for the larger certification program

Phase 2 is the first place where a certification claim must be grounded in actual Markdown engine behavior.

This checkpoint moves the repository from “frozen target only” into “executable renderer evidence exists,” while still documenting the remaining distance to final full certification.
