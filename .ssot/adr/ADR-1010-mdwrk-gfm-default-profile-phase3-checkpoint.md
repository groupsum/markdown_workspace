# ADR-1010: ADR-0010 — default GFM profile Phase 3 checkpoint

# ADR-0010 — default GFM profile Phase 3 checkpoint

Date: 2026-03-27
Status: Accepted

## Context

The Phase 0 certification freeze established that the product default is not bare CommonMark. It is **CommonMark 0.31.2 plus the default GFM profile**.

After the Phase 2 checkpoint, the renderer family had executable CommonMark-core evidence, but the repository still lacked an explicit default-profile closure lane covering:

- tables
- task list items
- strikethrough
- autolink literals

The client wrappers and examples also did not yet make that default profile explicit end-to-end.

## Decision

For this Phase 3 checkpoint the repository now treats **`gfm-default`** as an executable, named, default rendering profile layered on top of the Phase 2 CommonMark-core renderer baseline.

This checkpoint adopts the following concrete decisions:

- `@mdwrk/markdown-renderer-core` hardens default-profile parsing and rendering for GFM tables, task list items, strikethrough, and literal autolinks
- `@mdwrk/markdown-renderer-react` renders through the core engine with default `profile="gfm-default"` behavior
- the repository adds a named executable GFM test lane through `npm run test:renderer:gfm`
- the client markdown preview wrapper and HTML export adapter explicitly select `gfm-default`
- the editor working tree adds a task-list command and toolbar/example wiring as the first concrete authoring surface aligned with the default GFM profile

## Why this is the right checkpoint decision

This checkpoint makes the frozen default profile explicit in code, not only in documentation.

It also creates executable evidence that the current checkpoint handles the most important GFM default-profile deltas above CommonMark core, while staying inside the dependency surface available in the provided zip.

## Consequences

### Positive

- the repository now has a named, executable default-GFM lane
- the renderer family now emits task-list metadata, table alignment output, strikethrough markup, and literal autolinks through the portable core renderer
- the client wrappers and examples now reflect the frozen default profile more honestly
- the checkpoint carries machine-readable Phase 3 evidence

### Negative / still open

- this is still not full frozen-target GFM corpus closure
- browser-level clipboard/paste behavior for complex tables is not yet separately certified
- the editor-family authoring/UIX parity work is still incomplete beyond the task-list command and example wiring
- the provided zip still lacks parts of the app/example external toolchain required for full repository build/typecheck/test closure

## Follow-on work

The next closure steps after this checkpoint remain:

- full official GFM corpus integration where feasible within the frozen target
- broader editor-authoring parity closures from the v1→v2 gap ledger
- package/app/browser release-candidate evidence depth
- optional-profile closures beyond the default GFM profile
