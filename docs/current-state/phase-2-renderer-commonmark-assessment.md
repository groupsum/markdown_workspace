# Phase 2 renderer CommonMark assessment

Date: 2026-03-27
Checkpoint type: executable renderer-family checkpoint built on the Phase 0 and Phase 1 freezes

## What this checkpoint completes

This checkpoint completes a **substantive Phase 2 renderer-family update** for the current v2 repository.

The renderer family now has:

- committed self-contained renderer dist artifacts in the repo
- runnable renderer tests inside the checkpoint zip
- a portable internal AST surface
- synchronous and asynchronous HTML rendering
- policy-controlled raw HTML handling
- source-position attribute support
- official-seeded CommonMark-core subset evidence
- generated golden AST and HTML sample artifacts

## What materially changed

### The renderer family is now executable in the provided zip
The earlier renderer family in this checkpoint line referenced a missing external remark/rehype/react-markdown runtime/toolchain.

This Phase 2 checkpoint removes that dependency from the committed renderer dist by providing a self-contained implementation in the repository.

### The renderer package versions advanced
- `@mdwrk/markdown-renderer-core` moved to `1.1.0`
- `@mdwrk/markdown-renderer-react` moved to `1.1.0`

### Renderer evidence is now machine-readable
The checkpoint now carries a machine-readable Phase 2 renderer checkpoint artifact and a machine-readable CommonMark-core subset result artifact.

### The root renderer test lane now passes
`npm run test:renderer` succeeds in this checkpoint.

## What this checkpoint does not complete

This checkpoint still does **not** complete:

- full official CommonMark 0.31.2 corpus closure
- full default GFM closure
- final package build/typecheck closure across the whole repository
- the client-shell parity closures from the v1→v2 ledger
- release-candidate promotion or packed-artifact final certification closure

## Honest current status

This updated v2 checkpoint is a valid **Phase 2 renderer/CommonMark-core checkpoint**.

It is **not yet**:

- certifiably fully featured
- repository-internally RFC compliant across the full frozen boundary
- fully Markdown spec compliant across the full frozen CommonMark/GFM target

The renderer family is materially stronger than it was in Phase 1, but the repository as a whole still has open certification work.
