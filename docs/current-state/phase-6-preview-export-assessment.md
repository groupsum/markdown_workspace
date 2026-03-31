# Phase 6 preview, export, and render-policy assessment

Date: 2026-03-28
Checkpoint type: executable preview/export/render-policy checkpoint built on the Phase 0, Phase 1, Phase 2, Phase 3, Phase 4, and Phase 5 baselines

## What this checkpoint completes

This checkpoint completes a **substantive Phase 6 preview/export update** for the current v2 repository.

The repository now has:

- explicit HTML handling modes in the renderer family, including a real `sanitize` path
- rendered-root policy visibility via `data-markdown-html-handling`
- restored empty-list-item normalization in the active preview/export adapters
- active preview internal-link resolution against the current file tree
- HTML-export rewriting for relative Markdown file links
- preview/export advisory warnings wired through the active client shell
- accessible task-checkbox semantics in preview markup
- machine-readable Phase 6 evidence artifacts

## Executed evidence in this checkpoint

The following commands were run successfully in the checkpoint zip:

- `npm run test:renderer`
- `node packages/renderer/markdown-renderer-core/tests/preview-export-policy.mjs --json`
- `node packages/renderer/markdown-renderer-react/tests/preview-export-policy.mjs --json`
- `node apps/client/tests/phase6-preview-export-policy.mjs --json`
- `node tools/conformance/generate-phase6-preview-export-checkpoint.mjs`

Recorded results are captured in:

- `artifacts/conformance/latest/phase-6-preview-export-results.json`
- `artifacts/conformance/latest/phase-6-preview-export-checkpoint.json`

## What materially changed

### Renderer family
The reusable renderer family now closes several of the concrete preview/export-policy gaps identified by the Phase 6 plan.

`@mdwrk/markdown-renderer-core@1.1.0` now:

- exposes `escape`, `sanitize`, and `allow-trusted` HTML handling modes
- sanitizes blocked HTML containers and unsafe URL-bearing attributes in sanitize mode
- sanitizes unsafe Markdown link and image destinations in sanitize mode
- records the resolved HTML handling mode on rendered root output
- exposes accessible task-checkbox semantics in preview markup

`@mdwrk/markdown-renderer-react@1.1.0` now:

- inherits the renderer-core policy surface for component and static-document rendering
- has executable React/server tests for sanitized raw HTML, task accessibility semantics, and HTML document export coverage

### Client preview/export adapters
The current client checkpoint now includes:

- `normalizeEmptyListItemsForPreview()` as the parity restoration step for preview/export
- explicit HTML-policy resolution to `sanitize` by default and `allow-trusted` when trusted mode is enabled
- internal Markdown link resolution against the workspace tree
- pending-hash navigation support across file changes
- HTML export rewriting from `.md` / `.markdown` to `.html` targets
- preview/export advisory surfaces that make active policy/warning state visible

## What this checkpoint does not complete

This checkpoint still does **not** complete:

- Git/settings parity
- restore/import parity
- theme exposure parity
- language-selection and broader i18n parity
- final status-bar/action-rail parity
- final frozen-target CommonMark/GFM certification closure
- final repository-internal RFC closure across the full frozen boundary

The client app also still does **not** typecheck end-to-end in the provided zip because external dependency/toolchain gaps remain present.
The Phase 5 recorded client typecheck artifact remains the authoritative statement of that environment limitation for this checkpoint.

## Honest current status

This updated v2 checkpoint is a valid **Phase 6 preview/export/render-policy checkpoint**.

It is **not yet**:

- certifiably fully featured
- repository-internally RFC compliant across the full frozen boundary
- fully Markdown spec compliant across the full frozen CommonMark/GFM target

The repository is now materially stronger and less ambiguous than it was in Phase 5, but this checkpoint should still be treated as a **checkpointed partial closure**, not as final certification.
