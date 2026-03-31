# Phase 2 checkpoint summary

Date: 2026-03-27

This updated v2 zip is a **Phase 2 renderer/CommonMark-core checkpoint** built on top of:

- the Phase 0 certification-target freeze; and
- the Phase 1 release-train and compatibility-baseline freeze.

## Phase 2 artifacts present in this checkpoint

- `docs/adr/ADR-0009-renderer-commonmark-core-phase2-checkpoint.md`
- `docs/conformance/renderer-commonmark-core-phase2.md`
- `docs/current-state/phase-2-renderer-commonmark-assessment.md`
- `artifacts/conformance/latest/phase-2-renderer-commonmark-checkpoint.json`
- `artifacts/conformance/latest/phase-2-commonmark-subset-results.json`
- `tools/conformance/generate-phase2-renderer-checkpoint.mjs`

## Renderer package changes included in this checkpoint

- `@mdwrk/markdown-renderer-core` advanced from `1.0.0` to `1.1.0`
- `@mdwrk/markdown-renderer-react` advanced from `1.0.1` to `1.1.0`
- the renderer family now carries a committed **self-contained dist checkpoint** that no longer depends on the missing external remark/rehype/react-markdown toolchain inside this zip
- the core renderer now exposes:
  - `parseMarkdownToAst`
  - `renderMarkdownToHtmlSync`
  - policy-controlled raw HTML handling
  - source-position attributes
  - heading extraction from the internal AST
- the React renderer now renders through the core renderer rather than through `react-markdown`

## Evidence captured in this checkpoint

- `npm run test:renderer` passes in the checkpoint zip
- the committed CommonMark-core subset harness passed **20/20**
- negative renderer safety cases pass
- golden AST and HTML snapshots were generated for the Phase 2 sample document

## Honest current status

This checkpoint materially improves the renderer family and closes a real Phase 2 implementation lane.

It does **not** yet mean the repository is:

- certifiably fully featured
- repository-internally RFC compliant across the full frozen boundary
- fully Markdown spec compliant across the entire frozen CommonMark/GFM target

The important remaining gaps are still:

- no full official CommonMark 0.31.2 corpus closure across all examples
- no full GFM/default-profile closure yet
- no app-shell parity closure yet
- no final packed-artifact/release-candidate closure yet

## Start here

- `docs/current-state/phase-2-renderer-commonmark-assessment.md`
- `docs/conformance/renderer-commonmark-core-phase2.md`
- `artifacts/conformance/latest/phase-2-renderer-commonmark-checkpoint.json`
- `artifacts/conformance/latest/phase-2-commonmark-subset-results.json`
- `docs/conformance/current-certification-status.md`
