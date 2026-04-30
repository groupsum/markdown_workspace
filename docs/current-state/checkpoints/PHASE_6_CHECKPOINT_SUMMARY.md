# Phase 6 checkpoint summary

Date: 2026-03-28

This updated v2 zip is a **Phase 6 preview, export, and render-policy checkpoint** built on top of:

- the Phase 0 certification-target freeze;
- the Phase 1 release-train and compatibility-baseline freeze;
- the Phase 2 renderer/CommonMark-core checkpoint;
- the Phase 3 default-GFM checkpoint;
- the Phase 4 optional-profile checkpoint; and
- the Phase 5 editor semantics and authoring UX checkpoint.

## Phase 6 artifacts present in this checkpoint

- `docs/adr/ADR-0013-preview-export-and-render-policy-phase6-checkpoint.md`
- `docs/conformance/preview-export-phase6.md`
- `docs/current-state/phase-6-preview-export-assessment.md`
- `artifacts/conformance/latest/phase-6-preview-export-checkpoint.json`
- `artifacts/conformance/latest/phase-6-preview-export-results.json`
- `tools/conformance/generate-phase6-preview-export-checkpoint.mjs`

## What this checkpoint materially adds

- `@mdwrk/markdown-renderer-core@1.1.0` now carries an explicit three-mode raw HTML policy surface (`escape`, `sanitize`, `allow-trusted`) and exposes the resolved mode in rendered output via `data-markdown-html-handling`
- sanitize mode now strips blocked HTML containers, removes dangerous attributes, sanitizes unsafe URL-bearing attributes, and preserves accessible task-checkbox semantics in preview markup
- `@mdwrk/markdown-renderer-react@1.1.0` now inherits the hardened Phase 6 preview/export policy surface from the core renderer and has executable React/server evidence for those behaviors
- the active client preview now restores v1-style empty-list-item normalization, resolves internal Markdown links against the current file tree, preserves slugified heading anchors, and surfaces explicit preview-policy warnings
- the active client HTML export path now normalizes empty list items, rewrites Markdown file links to `.html`, emits explicit export-policy advisories, and routes through the reusable renderer package rather than an app-local divergence
- new executable policy lanes cover raw HTML sanitization, tables, tasks, footnotes, math, citations, internal-link resolution, and export-link rewriting

## Evidence captured in this checkpoint

Executed evidence in this checkpoint includes:

- `npm run test:renderer`
- `node packages/renderer/markdown-renderer-core/tests/preview-export-policy.mjs --json`
- `node packages/renderer/markdown-renderer-react/tests/preview-export-policy.mjs --json`
- `node apps/client/tests/phase6-preview-export-policy.mjs --json`
- `node tools/conformance/generate-phase6-preview-export-checkpoint.mjs`

## Honest current status

This checkpoint closes a meaningful **Phase 6 preview/export/render-policy lane**.

It does **not** yet mean the repository is:

- certifiably fully featured
- repository-internally RFC compliant across the full frozen boundary
- fully Markdown spec compliant across the entire frozen CommonMark/GFM target

The main remaining reasons are:

- broader v1→v2 regression closures remain open outside this Phase 6 boundary, especially Git PAT parity, restore/import flows, theme exposure parity, language selection parity, and status/action-rail parity
- the client app still does not typecheck end-to-end in the provided zip because the external dependency/toolchain surface is incomplete (`lucide-react`, `jszip`, `vitest`, and `ImportMeta.env` declarations remain unresolved in the checkpoint environment)
- frozen-target CommonMark/GFM corpus closure and later release-candidate evidence remain ahead of this phase
- citations and markdown-in-html remain outside the currently certified optional-profile boundary even though structural support and warnings are present

## Start here

- `docs/current-state/phase-6-preview-export-assessment.md`
- `docs/conformance/preview-export-phase6.md`
- `artifacts/conformance/latest/phase-6-preview-export-checkpoint.json`
- `artifacts/conformance/latest/phase-6-preview-export-results.json`
- `docs/conformance/current-certification-status.md`
