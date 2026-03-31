# Optional profiles — Phase 4 checkpoint

Date: 2026-03-28
Checkpoint type: executable optional-profile checkpoint built on the Phase 0, Phase 1, Phase 2, and Phase 3 baselines

## Scope of this checkpoint

This checkpoint closes the repository's first explicit optional-profile boundary.

The default Markdown product profile remains:

- **CommonMark 0.31.2 core**
- plus **GFM 0.29-gfm default behavior**

Optional profiles remain opt-in and are **not** silently mixed into the default profile.

## In-scope optional profiles in this checkpoint

The following optional profiles are now inside the certified optional-profile boundary for this checkpoint:

- front matter / metadata
- footnotes
- definition lists
- math
- superscript
- subscript
- smart punctuation

### Implemented behavior in this checkpoint

- per-profile parser activation in `@mdwrk/markdown-renderer-core`
- per-profile preview rendering in renderer core and React renderer
- per-profile static-document export routing
- app-level settings flags and persistence for profile toggles
- warnings when trusted-HTML-sensitive or experimental profiles affect preview/export behavior
- editor command affordances for front matter, footnotes, inline math, block math, superscript, subscript, and citation keys

## Explicitly out-of-scope profiles in this checkpoint

The following profiles are named and toggleable but remain **outside** the certified optional-profile boundary:

- citations
- markdown-in-html

### Why they remain outside the boundary

#### Citations

Citation keys render structurally, but bibliography resolution is not yet implemented in the certified boundary.

#### Markdown in HTML

Markdown-in-HTML requires trusted HTML policy and remains experimental in this checkpoint. Marked HTML containers can be interpreted only when trusted HTML preview/export is enabled.

## Executed evidence

The following commands were executed successfully in this checkpoint:

- `node packages/renderer/markdown-renderer-core/tests/optional-profiles.mjs --json`
- `node packages/renderer/markdown-renderer-react/tests/optional-profile-surface.mjs --json`
- `node packages/editor/markdown-editor-core/tests/run-smoke.mjs --json`
- `node packages/editor/markdown-editor-react/tests/run-smoke.mjs --json`

Recorded results:

- renderer core optional-profile lane: **8/8**
- renderer React optional-profile lane: **4/4**
- editor core smoke/optional-command lane: **9/9**
- editor React smoke lane: **3/3**
- aggregate recorded checks: **24/24**

## App-layer closure in this checkpoint

The client app now includes:

- a `Markdown Profiles` settings panel
- persisted optional-profile toggles
- a trusted HTML preview/export toggle
- preview warnings for experimental or trusted-HTML-sensitive profiles
- export warnings injected into static HTML documents when relevant
- toolbar affordances for inline math, footnotes, superscript, and subscript in the app editor pane

## Limits of this checkpoint

This checkpoint still does **not** prove:

- final full-frozen-target Markdown certification
- final trusted-HTML closure for markdown-in-html
- bibliography management / bibliography rendering closure for citations
- broader v1→v2 UIX parity closure
- full app-wide build/typecheck/test closure under the provided zip's incomplete external dependency/toolchain surface

## Honest status

This is a valid **Phase 4 optional-profile checkpoint**.

It is **not yet**:

- certifiably fully featured
- repository-internally RFC compliant across the full frozen boundary
- fully Markdown spec compliant across the full frozen CommonMark/GFM target
