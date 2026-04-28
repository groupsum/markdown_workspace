# Phase 3 checkpoint summary

Date: 2026-03-27

This updated v2 zip is a **Phase 3 default-GFM checkpoint** built on top of:

- the Phase 0 certification-target freeze;
- the Phase 1 release-train and compatibility-baseline freeze; and
- the Phase 2 renderer/CommonMark-core checkpoint.

## Phase 3 artifacts present in this checkpoint

- `docs/adr/ADR-0010-gfm-default-profile-phase3-checkpoint.md`
- `docs/conformance/gfm-default-profile-phase3.md`
- `docs/current-state/phase-3-gfm-default-profile-assessment.md`
- `artifacts/conformance/latest/phase-3-gfm-default-profile-checkpoint.json`
- `artifacts/conformance/latest/phase-3-gfm-default-profile-results.json`
- `tools/conformance/generate-phase3-gfm-checkpoint.mjs`

## What this checkpoint materially adds

- the repository now carries an explicit executable **default GFM profile** lane on top of the Phase 2 CommonMark-core renderer baseline
- `@mdwrk/markdown-renderer-core@1.1.0` now hardens default-profile support for:
  - tables
  - task list items
  - strikethrough
  - autolink literals
- `@mdwrk/markdown-renderer-react@1.1.0` now renders through the core engine with default `profile="gfm-default"` behavior and executable GFM surface tests
- the editor family now includes a checkpoint-scoped task-list command and toolbar/example alignment for source authoring against the default GFM profile
- the client render wrappers and export adapter now explicitly select `gfm-default`

## Evidence captured in this checkpoint

Executed evidence in this checkpoint includes:

- `npm run test:renderer:gfm` → renderer-core default GFM lane passed **7/7**
- `npm run test -w @mdwrk/markdown-renderer-react` → React renderer GFM/smoke surface checks passed **9/9**
- `npm run test -w @mdwrk/markdown-editor-core` → editor-core smoke checks passed **7/7**
- `npm run test -w @mdwrk/markdown-editor-react` → editor-react smoke checks passed **3/3**

Aggregate executed Phase 3 checks captured in the machine-readable artifact: **26/26**.

## Honest current status

This checkpoint closes a meaningful **Phase 3 default-GFM lane**.

It does **not** yet mean the repository is:

- certifiably fully featured
- repository-internally RFC compliant across the full frozen boundary
- fully Markdown spec compliant across the entire frozen CommonMark/GFM target

The main remaining reasons are:

- the checkpoint still does not prove full frozen-target GFM corpus closure example-by-example
- app/client and example-wide build/typecheck closure are still constrained by the incomplete external dependency/toolchain surface present in the provided zip
- broader v1→v2 UIX parity closures are still open outside this Phase 3 boundary
- optional Markdown profiles are still outside this checkpoint

## Start here

- `docs/current-state/phase-3-gfm-default-profile-assessment.md`
- `docs/conformance/gfm-default-profile-phase3.md`
- `artifacts/conformance/latest/phase-3-gfm-default-profile-checkpoint.json`
- `artifacts/conformance/latest/phase-3-gfm-default-profile-results.json`
- `docs/conformance/current-certification-status.md`
