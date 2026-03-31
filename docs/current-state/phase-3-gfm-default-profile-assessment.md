# Phase 3 default GFM profile assessment

Date: 2026-03-27
Checkpoint type: executable default-profile checkpoint built on the Phase 0, Phase 1, and Phase 2 baselines

## What this checkpoint completes

This checkpoint completes a **substantive Phase 3 default-GFM update** for the current v2 repository.

The repository now has:

- a named executable default-GFM profile lane on top of the Phase 2 CommonMark-core baseline
- hardened renderer support for tables, task list items, strikethrough, and literal autolinks
- React renderer surface tests proving GFM markup reaches component and static-document output
- editor-core task-list command support for source authoring
- adapter-level propagation of `gfm-default` into the client preview and export wrappers
- example updates that demonstrate the default profile instead of a CommonMark-only sample set
- machine-readable Phase 3 evidence artifacts

## Executed evidence in this checkpoint

The following commands were run successfully in the checkpoint zip:

- `npm run test:renderer:gfm`
- `npm run test -w @mdwrk/markdown-renderer-react`
- `npm run test -w @mdwrk/markdown-editor-core`
- `npm run test -w @mdwrk/markdown-editor-react`

Recorded results:

- renderer core GFM lane: **7/7**
- renderer React GFM surface lane: **5/5**
- renderer React smoke lane: **4/4**
- editor core smoke lane: **7/7**
- editor React smoke lane: **3/3**
- aggregate recorded checks: **26/26**

## What materially changed

### Renderer family
The renderer family now makes the default profile explicit rather than implicit.

`@mdwrk/markdown-renderer-core@1.1.0` now includes concrete default-profile behavior for:

- tables
- task list items
- strikethrough
- literal autolinks

`@mdwrk/markdown-renderer-react@1.1.0` now propagates the selected profile through the server/static render helpers and the component surface.

### Editor family
The editor family now includes a task-list command in the core command surface and a task-list example/button wiring path in the React/editor-host consumers.

This is useful progress, but it is still **not** the full editor parity closure promised by later phases.

### Client adapters
The current client checkpoint now explicitly routes preview/export through `gfm-default` where the touched adapters were updated.

This means the repository is less ambiguous about its real default markdown behavior than it was in earlier checkpoints.

## What this checkpoint does not complete

This checkpoint still does **not** complete:

- full frozen-target GFM corpus closure
- final CommonMark + GFM + optional-profile certification closure
- full app-wide build/typecheck/test closure under the provided zip's incomplete external toolchain surface
- browser-certified clipboard/paste behavior for complex tables
- broader v1→v2 UIX parity closures around settings, status bar, action rail, themes, language selection, line-number controls, and Git settings
- final release-candidate promotion evidence

## Honest current status

This updated v2 checkpoint is a valid **Phase 3 default-GFM checkpoint**.

It is **not yet**:

- certifiably fully featured
- repository-internally RFC compliant across the full frozen boundary
- fully Markdown spec compliant across the full frozen CommonMark/GFM target

The repository is now stronger and less ambiguous than it was in Phase 2, but this checkpoint should still be treated as a **checkpointed partial closure**, not as final certification.
