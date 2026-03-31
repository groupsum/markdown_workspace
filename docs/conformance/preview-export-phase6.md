# Phase 6 — preview, export, and render-policy checkpoint

Date: 2026-03-28

## Scope

This document records the executable **Phase 6 preview/export/render-policy checkpoint** for the current v2 repository.

The checkpoint keeps:

- slugified heading IDs
- reusable renderer package architecture
- theme-aware renderer theming hooks

It restores or defines:

- empty list-item normalization before preview/export where needed for v1 parity
- explicit raw HTML trust modes
- sanitization behavior for trusted vs untrusted preview/export
- HTML document export behavior
- compatibility warnings for profiles whose preview/export semantics depend on policy or boundary status
- internal-link resolution behavior for Markdown file links and hash links
- preview task accessibility semantics

## Implemented policy surface

### HTML handling modes

The reusable renderer family now exposes a three-mode HTML policy surface:

- `escape` — raw HTML is emitted as text
- `sanitize` — raw HTML is filtered for active content and unsafe URL-bearing attributes while retaining safer structural fragments
- `allow-trusted` — raw HTML is passed through as trusted content, including experimental markdown-in-html handling where enabled

The active client preview/export adapters now resolve policy as follows:

- default preview/export: `sanitize`
- trusted HTML mode enabled: `allow-trusted`

The resolved mode is emitted in renderer output as `data-markdown-html-handling`.

### Empty list-item normalization

The active client preview/export adapters now restore v1-style normalization for empty list items so visually empty bullets, ordered items, and task items remain visible in preview/export output.

This normalization is applied before content is handed to the reusable renderer packages. Fenced code blocks are preserved without normalization.

### Internal link behavior

The active preview shell now:

- scrolls same-document hash links against slugified heading IDs
- resolves relative Markdown file links against the current file path and workspace tree
- preserves pending preview-hash navigation when moving between files

The HTML export pipeline rewrites relative `.md` / `.markdown` links to `.html` output targets while leaving external and hash-only links unchanged.

### Task accessibility semantics

Task list markup now carries:

- `aria-label="Task completed"` / `aria-label="Task not completed"`
- `aria-checked="true"` / `aria-checked="false"`

This keeps preview markup more informative and testable than the earlier decorative-only checkbox surface.

## Executed evidence in this checkpoint

Executed evidence includes:

- `npm run test:renderer`
- `node packages/renderer/markdown-renderer-core/tests/preview-export-policy.mjs --json`
- `node packages/renderer/markdown-renderer-react/tests/preview-export-policy.mjs --json`
- `node apps/client/tests/phase6-preview-export-policy.mjs --json`
- `node tools/conformance/generate-phase6-preview-export-checkpoint.mjs`

## Evidence lanes used

This checkpoint aggregates the following renderer/client lanes:

- CommonMark-core subset lane
- default-GFM lane
- optional-profile lane
- renderer-core preview/export policy lane
- renderer-react preview/export policy lane
- client preview/export helper and link-resolution lane

Together these cover raw HTML policy plus tables, task lists, footnotes, math, citations, and HTML export document generation in the current checkpoint boundary.

## Known limits

This checkpoint still does **not** mean that the repository is finally certified. The main remaining limits are:

- final frozen-target CommonMark/GFM corpus closure is still incomplete
- citations and markdown-in-html remain outside the currently certified optional-profile boundary
- broader v1→v2 parity work remains open in Git/settings/theme/i18n/status/action-rail surfaces
- the provided zip still lacks some external dependency/toolchain pieces required for full repository-wide app typecheck/build closure
