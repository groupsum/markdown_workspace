# ADR-0012 — editor semantics and authoring UX Phase 5 checkpoint

Date: 2026-03-28
Status: Accepted

## Context

The Phase 0 target freeze and the v1→v2 gap analysis established that the repository could not claim a fully featured UIX while the editor surface still lacked concrete authoring affordances that v1 had exposed.

At the end of Phase 4, the repository still had open editor-authoring gaps in the active v2 shell:

- no bullet-list toolbar action in the reusable editor family
- no restored indent / outdent toolbar affordance in the client shell
- no explicit selection-format state for toolbar active highlighting
- no executable Enter continuation / termination proof for ordered, unordered, and task lists
- no shell-exposed and persisted line-number toggle, despite reusable gutter support already existing
- no restored rhythm token contract for aligning gutter rows, editor lines, and preview line-height behavior

The Phase 5 plan required these closures to happen in the reusable editor packages first, with shell integration and current-state documentation following immediately afterward.

## Decision

For this Phase 5 checkpoint, the repository now treats **editor semantics and authoring UX** as an executable, evidence-backed checkpoint lane with the following concrete decisions:

- `@mdwrk/markdown-editor-core` advances to `1.1.0` and now includes:
  - `bullet-list` command support
  - deterministic Enter-continuation helpers for unordered, ordered, and task lists
  - empty-list termination behavior for task and plain list items
  - `computeSelectionFormatState()` for active-toolbar state derivation
- `@mdwrk/markdown-editor-react` advances to `1.1.0` and now:
  - handles Enter continuation/termination in the textarea surface
  - emits selection-format state through `onSelectionFormatChange`
  - disables soft wrapping via `wrap="off"` so gutter rows track logical lines
  - reads gutter-width and line-rhythm values from restored token surfaces
- `@mdwrk/ui-tokens` advances to `1.1.0` and now restores the editor/preview rhythm tokens needed for v1-aligned gutter and markdown line-height behavior
- `@mdwrk/mdwrkspace` advances to `1.4.0` and now:
  - exposes bullet-list, task-list, indent, and outdent toolbar actions
  - highlights bold / italic / strikethrough / bullet-list / task-list states when applicable
  - exposes a `LINE_NUMBERS` session-state setting
  - persists `showLineNumbers` in both UI state and session state
- underline remains **outside** the standard Markdown model and is not implemented as `__...__`

## Why this is the right checkpoint decision

This checkpoint closes exactly the editor-authoring items that were both:

- explicitly called out by the v1→v2 regression ledger; and
- reasonably closeable inside the reusable editor family and current v2 shell without first solving unrelated Git/settings/theme/i18n release work.

It also avoids making a false standards claim about underline. The repository now keeps underline out of the default Markdown authoring surface unless a future extension-only decision is made.

## Consequences

### Positive

- the reusable editor family now materially covers the core Phase 5 authoring affordances
- the client shell once again exposes line-number control instead of hiding reusable gutter support behind package-only props
- the repository now has machine-readable Phase 5 evidence and a repeatable checkpoint generator
- the token contract is better aligned with the v1 editor/preview rhythm behavior

### Negative / still open

- this checkpoint does not close broader shell/settings/Git/theme/i18n parity gaps
- the client app still does not typecheck end-to-end in the provided zip because the external dependency/toolchain surface is incomplete
- the repository still does not have final frozen-target CommonMark/GFM certification closure
- the new file-based component/unit suites were added, but the provided zip does not ship a locally runnable Vitest binary; package smoke lanes remain the primary executed evidence in this checkpoint

## Follow-on work

The next closure steps after this checkpoint remain:

- preview/export policy closure and any remaining Phase 6 app-shell parity work
- Git/settings/provider parity closure
- theme exposure parity and i18n closure
- stricter conformance corpus integration and RC evidence depth
