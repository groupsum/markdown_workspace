# Editor semantics and authoring UX Phase 5 checkpoint

Date: 2026-03-28

## What this checkpoint closes

This checkpoint closes a **real Phase 5 editor-authoring lane** on top of the earlier Phase 0–4 baselines.

The Phase 5 boundary for this checkpoint includes:

- source-mode authoring commands and keyboard behavior in the reusable editor family
- toolbar active-state awareness in the client shell
- shell-exposed and persisted line-number control
- token-level line-rhythm and gutter-width restoration needed for vertical gutter fidelity
- example-level proof that the package/editor surface can be exercised outside the main app shell

## Implemented editor-authoring features in this checkpoint

### Portable editor core
`@mdwrk/markdown-editor-core@1.1.0` now includes:

- `bullet-list`
- `task-list`
- `indent`
- `outdent`
- deterministic list continuation and termination helpers for Enter behavior
- selection-format state computation for:
  - bold
  - italic
  - strikethrough
  - bullet-list state
  - task-list state

### React editor surface
`@mdwrk/markdown-editor-react@1.1.0` now includes:

- Enter continuation for ordered, unordered, and task lists
- empty list-item termination behavior
- `onSelectionFormatChange`
- optional line-number gutter suppression
- `wrap="off"` to keep gutter rows aligned to logical source lines
- token-aware gutter width and line-height bridging

### Client shell integration
`@mdwrk/mdwrkspace@1.4.0` now includes:

- bullet-list toolbar action
- task-list toolbar action
- indent toolbar action
- outdent toolbar action
- active toolbar highlighting for:
  - bold
  - italic
  - strikethrough
  - bullet-list
  - task-list
- a session-state `LINE_NUMBERS` toggle
- UI/session persistence for `showLineNumbers`

### Token and CSS contract restoration
`@mdwrk/ui-tokens@1.1.0` now restores:

- `--editor-line-height`
- `--editor-line-rhythm`
- `--markdown-line-height`
- `--markdown-heading-line-height`
- `--line-number-gutter-width`
- `--mobile-rail-expanded-width`
- `--mobile-expandable-rail-width`

The client/editor CSS now consumes these restored rhythm tokens for gutter rows and textarea line-height.

## Evidence captured here

### Executed smoke lanes
This checkpoint carries executed evidence for:

- `node packages/editor/markdown-editor-core/tests/run-smoke.mjs --json`
- `node packages/editor/markdown-editor-react/tests/run-smoke.mjs --json`

Recorded results:

- editor-core smoke lane: **12 / 12**
- editor-react smoke lane: **5 / 5**
- aggregate executed test checks: **17 / 17**

### Structural app/surface audit
The checkpoint also carries a file/surface audit for:

- editor toolbar wiring
- WorkPane/AppShell prop propagation
- UI/session persistence wiring
- settings-panel toggle exposure
- editor/gutter CSS token consumption
- shared token restoration
- example-level authoring controls

Recorded structural audit checks: **40 / 40**.

See:

- `artifacts/conformance/latest/phase-5-editor-authoring-results.json`
- `artifacts/conformance/latest/phase-5-editor-authoring-checkpoint.json`

## Important policy notes

- underline was **not** implemented as `__...__` because that syntax is strong emphasis, not underline
- this checkpoint keeps underline outside the default Markdown authoring model
- heading slug IDs from v2 remain intact; this checkpoint does not revert that Phase 2+/preview improvement
- Tab continues to drive structural indent/outdent behavior in the current editor surface

## What this checkpoint does not complete

This checkpoint still does **not** complete:

- final frozen-target CommonMark + GFM certification closure
- broader v1→v2 shell/settings/Git/theme/i18n parity
- full app-wide typecheck/build closure under the provided zip's incomplete external dependency surface
- release-candidate packaging and promotion evidence

## Why this matters for the larger certification program

Phase 5 is the point where the repository must stop claiming that the editor family is merely “portable” while leaving obvious authoring affordances and line-number/session behavior out of the shell.

This checkpoint makes the reusable editor family and the active client shell materially closer to v1 parity while staying honest about the remaining gaps outside the Phase 5 boundary.
