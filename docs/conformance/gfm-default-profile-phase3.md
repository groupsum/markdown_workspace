# Default GFM profile Phase 3 checkpoint

Date: 2026-03-27

## What this checkpoint closes

This checkpoint closes a **real Phase 3 default-GFM implementation lane** on top of the Phase 2 CommonMark-core renderer baseline.

The default product profile is frozen as **CommonMark 0.31.2 + GitHub Flavored Markdown 0.29-gfm**.
In this checkpoint the named default profile is implemented as **`gfm-default`**.

## Default-enabled GFM features in this checkpoint

The following features are enabled by default on top of CommonMark core:

- tables
- task list items
- strikethrough
- autolink literals

These are the only GFM deltas claimed by this checkpoint as default-enabled features.
Optional profiles such as front matter, footnotes, math, citations, and smart punctuation remain outside this Phase 3 closure.

## What materially changed

### Renderer core
`@mdwrk/markdown-renderer-core@1.1.0` now hardens the default profile for:

- table parsing and HTML rendering
- alignment parsing from the table delimiter row
- task list item detection and list metadata emission
- checkbox rendering for task list items in preview HTML
- strikethrough parsing/rendering through `<del>`
- autolink literal handling for `https://...`, `www...`, and email literals
- profile-aware inline recursion so nested emphasis/strong/link code paths stay in the selected profile

### React renderer
`@mdwrk/markdown-renderer-react@1.1.0` now renders through the core engine with default-profile support propagated through:

- `<MarkdownRenderer />`
- `renderMarkdownToStaticHtml()`
- `renderMarkdownToStaticHtmlDocument()`

### Editor authoring surface
The editor family now includes a checkpoint-scoped task-list command and example wiring so source-mode authoring can generate default-profile task list syntax.

This checkpoint does **not** claim final editor parity yet. It closes only the first necessary GFM authoring affordance for task lists in the current zip.

### Client adapters and examples
The repository now carries explicit adapter-level default-profile selection in:

- `apps/client/components/Markdown/WorkspaceMarkdownRenderer.tsx`
- `apps/client/services/htmlExport.tsx`

The editor pane and examples now also surface task-list/default-profile alignment through:

- `apps/client/components/Chassis/WorkPane/Stage/EditorPane.tsx`
- `examples/renderer-basic/App.tsx`
- `examples/editor-basic/App.tsx`

## Evidence captured here

### Named GFM lane
The checkpoint includes a named default-GFM lane:

- `npm run test:renderer:gfm`

This lane currently executes the renderer-core GFM suite.

### Machine-readable Phase 3 evidence
See:

- `artifacts/conformance/latest/phase-3-gfm-default-profile-results.json`
- `artifacts/conformance/latest/phase-3-gfm-default-profile-checkpoint.json`

### Executed results in this checkpoint

- renderer core default-GFM suite: **7 / 7**
- renderer React GFM surface checks: **5 / 5**
- renderer React smoke checks: **4 / 4**
- editor core smoke checks: **7 / 7**
- editor React smoke checks: **3 / 3**

Aggregate executed Phase 3 checks recorded in the artifact: **26 / 26**.

## Important limits

This checkpoint is **not yet final strict conformance**.

It still does **not** prove:

- full example-by-example closure for the entire frozen GFM target
- browser-certified clipboard/paste behavior for complex tables
- full app-wide preview/export/toolbar closure under the complete client toolchain
- broader editor/UIX parity closures such as bullet-list button parity, indent/dedent toolbar parity, selection-state highlighting, list continuation, and line-number settings persistence

## Why this matters for the larger certification program

Phase 3 is the point where the repository must stop implying that “default Markdown” means only CommonMark core.

This checkpoint makes the frozen default profile explicit in code, tests, examples, export paths, and current-state documentation, while still documenting the remaining distance to final full certification.
