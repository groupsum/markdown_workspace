# Phase 4 checkpoint summary

Date: 2026-03-28

This updated v2 zip is a **Phase 4 optional-profile checkpoint** built on top of:

- the Phase 0 certification-target freeze;
- the Phase 1 release-train and compatibility-baseline freeze;
- the Phase 2 renderer/CommonMark-core checkpoint; and
- the Phase 3 default-GFM checkpoint.

## Phase 4 artifacts present in this checkpoint

- `docs/adr/ADR-0011-optional-profile-boundary-phase4-checkpoint.md`
- `docs/conformance/optional-profiles-phase4.md`
- `docs/current-state/phase-4-optional-profiles-assessment.md`
- `artifacts/conformance/latest/phase-4-optional-profiles-checkpoint.json`
- `artifacts/conformance/latest/phase-4-optional-profiles-results.json`
- `tools/conformance/generate-phase4-optional-profiles-checkpoint.mjs`

## What this checkpoint materially adds

- the repository now carries an explicit **named optional-profile registry** in the reusable renderer family
- the renderer family now includes toggleable optional-profile handling for:
  - front matter / metadata
  - footnotes
  - definition lists
  - math
  - superscript
  - subscript
  - smart punctuation
- the repository now names **citations** and **markdown-in-html** as experimental / outside the certified optional-profile boundary in this checkpoint
- `@mdwrk/markdown-renderer-react` now propagates optional profiles through component and static-document rendering
- the editor-core command surface now includes optional-profile authoring commands for front matter, footnotes, inline math, block math, superscript, subscript, and citation keys
- the client app now exposes a **Markdown Profiles** settings section, persists profile toggles, routes preview/export through the selected profile configuration, and emits warnings when trusted HTML or experimental profiles affect preview/export behavior
- the client editor toolbar now includes optional-profile affordances for inline math, footnotes, superscript, and subscript
- examples now demonstrate optional-profile usage explicitly

## Evidence captured in this checkpoint

Executed evidence in this checkpoint includes:

- `node packages/renderer/markdown-renderer-core/tests/optional-profiles.mjs --json` → renderer-core optional-profile lane passed **8/8**
- `node packages/renderer/markdown-renderer-react/tests/optional-profile-surface.mjs --json` → renderer-react optional-profile lane passed **4/4**
- `node packages/editor/markdown-editor-core/tests/run-smoke.mjs --json` → editor-core smoke / optional-command lane passed **9/9**
- `node packages/editor/markdown-editor-react/tests/run-smoke.mjs --json` → editor-react smoke lane passed **3/3**

Aggregate executed Phase 4 checks captured in the machine-readable artifact: **24/24**.

## Honest current status

This checkpoint closes a meaningful **Phase 4 optional-profile boundary**.

It does **not** yet mean the repository is:

- certifiably fully featured
- repository-internally RFC compliant across the full frozen boundary
- fully Markdown spec compliant across the entire frozen CommonMark/GFM target

The main remaining reasons are:

- the checkpoint still does not prove full frozen-target CommonMark/GFM corpus closure example-by-example
- only a subset of named optional profiles is currently inside the certified boundary; citations and markdown-in-html remain outside that boundary in this checkpoint
- broader v1→v2 UIX parity closures are still open outside this Phase 4 boundary
- Git/settings parity, restore/import closure, theme exposure closure, status/action-rail parity, language selection closure, and broader extension-settings completion are still ahead
- app/client and example-wide build/typecheck closure are still constrained by the incomplete external dependency/toolchain surface present in the provided zip

## Start here

- `docs/current-state/phase-4-optional-profiles-assessment.md`
- `docs/conformance/optional-profiles-phase4.md`
- `artifacts/conformance/latest/phase-4-optional-profiles-checkpoint.json`
- `artifacts/conformance/latest/phase-4-optional-profiles-results.json`
- `docs/conformance/current-certification-status.md`
