# Phase 4 optional profiles assessment

Date: 2026-03-28
Checkpoint type: executable optional-profile checkpoint built on the Phase 0, Phase 1, Phase 2, and Phase 3 baselines

## What this checkpoint completes

This checkpoint completes a **substantive Phase 4 optional-profile update** for the current v2 repository.

The repository now has:

- a named optional-profile registry in the reusable renderer family
- explicit checkpoint-scoped in-scope vs out-of-scope optional-profile classification
- renderer-core support for front matter, footnotes, definition lists, math, superscript, subscript, smart punctuation, and experimental citations / markdown-in-html warnings
- renderer-react propagation of optional profiles through component and static-document rendering
- editor-core command support for front matter, footnotes, inline math, block math, superscript, subscript, and citations
- app-level profile settings and persistence for optional-profile toggles and trusted HTML behavior
- app preview/export warnings for experimental or trust-policy-sensitive profiles
- examples aligned to explicit optional-profile usage
- machine-readable Phase 4 evidence artifacts

## Executed evidence in this checkpoint

The following commands were run successfully in the checkpoint zip:

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

## What materially changed

### Renderer family

The renderer family now exposes an explicit optional-profile registry and a clearer policy surface.

The reusable renderer now:

- resolves named optional profile IDs
- records warnings for experimental profiles
- treats markdown-in-html as a policy-controlled path rather than an accidental passthrough
- appends footnote sections and metadata where appropriate
- renders definition lists, math wrappers, superscript, subscript, and smart punctuation transforms

### Editor family

The editor family now exposes optional-profile authoring commands beyond the default GFM checkpoint.

These include commands for:

- front matter
- footnotes
- inline math
- block math
- superscript
- subscript
- citations

The app editor toolbar now surfaces a subset of these commands directly.

### Client adapters

The client checkpoint now routes preview and export through stored Markdown profile configuration rather than a hard-coded default-only path.

This reduces ambiguity about:

- which optional profiles are active
- whether trusted HTML is enabled for preview/export
- when experimental profiles are being exercised outside the certified boundary

## What this checkpoint does not complete

This checkpoint still does **not** complete:

- full frozen-target CommonMark + GFM + optional-profile certification closure
- full closure for citations or markdown-in-html inside the certified optional-profile boundary
- final Git/settings parity, restore/import closure, line-number/session closure, theme exposure closure, or language-selection closure
- final release-candidate promotion evidence
- full app-wide typecheck/build closure under the incomplete external dependency surface in the provided zip

## Honest current status

This updated v2 checkpoint is a valid **Phase 4 optional-profile checkpoint**.

It is **not yet**:

- certifiably fully featured
- repository-internally RFC compliant across the full frozen boundary
- fully Markdown spec compliant across the full frozen CommonMark/GFM target

The repository is now materially stronger and more explicit than it was in Phase 3, but this checkpoint should still be treated as a **checkpointed partial closure**, not as final certification.
