# Phase 5 checkpoint summary

Date: 2026-03-28

This updated v2 zip is a **Phase 5 editor semantics and authoring UX checkpoint** built on top of:

- the Phase 0 certification-target freeze;
- the Phase 1 release-train and compatibility-baseline freeze;
- the Phase 2 renderer/CommonMark-core checkpoint;
- the Phase 3 default-GFM checkpoint; and
- the Phase 4 optional-profile checkpoint.

## Phase 5 artifacts present in this checkpoint

- `docs/adr/ADR-0012-editor-semantics-and-authoring-ux-phase5-checkpoint.md`
- `docs/conformance/editor-authoring-phase5.md`
- `docs/current-state/phase-5-editor-authoring-assessment.md`
- `artifacts/conformance/latest/phase-5-editor-authoring-checkpoint.json`
- `artifacts/conformance/latest/phase-5-editor-authoring-results.json`
- `artifacts/conformance/latest/phase-5-editor-core-results.json`
- `artifacts/conformance/latest/phase-5-editor-react-results.json`
- `artifacts/conformance/latest/phase-5-client-typecheck.txt`
- `tools/conformance/generate-phase5-editor-authoring-checkpoint.mjs`

## What this checkpoint materially adds

- `@mdwrk/markdown-editor-core@1.1.0` now includes:
  - `bullet-list` command support
  - deterministic list continuation and termination helpers for Enter behavior
  - selection-format state computation for toolbar active highlighting
- `@mdwrk/markdown-editor-react@1.1.0` now includes:
  - Enter continuation / termination behavior for ordered, unordered, and task lists
  - `onSelectionFormatChange` callbacks for toolbar state
  - `wrap="off"` so logical lines align with the gutter
  - token-aware gutter width and line-rhythm styling
- `@mdwrk/ui-tokens@1.1.0` now restores the v1-aligned rhythm tokens needed for editor and preview alignment:
  - `--editor-line-height`
  - `--editor-line-rhythm`
  - `--markdown-line-height`
  - `--markdown-heading-line-height`
  - `--line-number-gutter-width`
  - `--mobile-rail-expanded-width`
  - `--mobile-expandable-rail-width`
- `@mdwrk/mdwrkspace@1.4.0` now carries:
  - bullet-list, task-list, indent, and outdent toolbar actions
  - active-state highlighting for bold / italic / strikethrough / bullet-list / task-list
  - a shell-exposed `LINE_NUMBERS` session setting
  - persisted session/UI state for `showLineNumbers`
  - WorkPane/AppShell propagation of the line-number preference into the reusable editor
- the editor example now demonstrates:
  - bullet and task creation
  - indent and outdent
  - line-number toggling
  - continued renderer-backed preview

## Evidence captured in this checkpoint

Executed evidence in this checkpoint includes:

- `npm run build -w @mdwrk/ui-tokens`
- `npm run build -w @mdwrk/markdown-editor-core`
- `npm run build -w @mdwrk/markdown-editor-react`
- `npm run test -w @mdwrk/markdown-editor-core`
- `npm run test -w @mdwrk/markdown-editor-react`
- `node packages/editor/markdown-editor-core/tests/run-smoke.mjs --json`
- `node packages/editor/markdown-editor-react/tests/run-smoke.mjs --json`
- `node tools/conformance/generate-phase5-editor-authoring-checkpoint.mjs`

Recorded executed Phase 5 checks:

- editor-core smoke lane: **12 / 12**
- editor-react smoke lane: **5 / 5**
- aggregate recorded test checks: **17 / 17**
- structural file/surface audit checks: **40 / 40**

## Honest current status

This checkpoint closes a meaningful **Phase 5 editor semantics and authoring UX lane**.

It does **not** yet mean the repository is:

- certifiably fully featured
- repository-internally RFC compliant across the full frozen boundary
- fully Markdown spec compliant across the entire frozen CommonMark/GFM target

The main remaining reasons are:

- broader v1→v2 regression closures remain open outside this Phase 5 boundary, especially Git PAT parity, restore/import flows, theme exposure parity, language selection parity, and status/action-rail parity
- the client app still does not typecheck end-to-end in the provided zip because the external dependency/toolchain surface is incomplete (`lucide-react`, `jszip`, `vitest`, and `ImportMeta.env` declarations remain unresolved in the checkpoint environment)
- frozen-target CommonMark/GFM corpus closure and later release-candidate evidence remain ahead of this phase
- underline remains outside the standard Markdown authoring model and was **not** implemented as `__...__`

## Start here

- `docs/current-state/phase-5-editor-authoring-assessment.md`
- `docs/conformance/editor-authoring-phase5.md`
- `artifacts/conformance/latest/phase-5-editor-authoring-checkpoint.json`
- `artifacts/conformance/latest/phase-5-editor-authoring-results.json`
- `docs/conformance/current-certification-status.md`
