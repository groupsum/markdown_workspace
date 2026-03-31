# ADR-0016 — Phase 9 theme inventory, token contract, and visual parity checkpoint

Date: 2026-03-28
Status: accepted for the current checkpoint zip

## Context

The v1→v2 audit established that v2 shipped twelve theme CSS assets but only exposed five of them in the active selector registry.
The audit also established that several rhythm and responsive-width tokens remained outside the formal portable contract even though similar values already existed in app-local CSS.

After Phase 8, the dominant remaining visual/UIX parity gap was therefore:

- shipped theme assets were not all selectable
- theme selector surfaces did not reflect the actual shipped theme inventory
- portable contract coverage for editor/preview rhythm and responsive shell width was incomplete
- responsive small-layout rules still hard-coded mobile widths instead of consuming shared tokens
- the repository still lacked a checkpointed visual-baseline artifact set for the restored theme inventory

## Decision

This checkpoint accepts the following decisions.

### Theme inventory parity is now a named executable checkpoint lane

The repository now carries a Phase 9 checkpoint with explicit evidence for:

- restoration of the seven previously hidden theme IDs to the active theme registry
- parity between shipped theme assets and selectable theme surfaces
- restoration of all twelve selectable themes across the active client theme selectors
- machine-readable proof that the theme registry, stylesheet registry, and theme asset directory align

### The portable theme contract expands in this checkpoint

The following token surfaces are now formalized in `@mdwrk/theme-contract@1.1.0` and `@mdwrk/ui-tokens@1.2.0`:

- `editor-line-height`
- `editor-line-rhythm`
- `line-number-gutter-width`
- `markdown-line-height`
- `markdown-heading-line-height`
- `mobile-rail-expanded-width`
- `mobile-expandable-rail-width`

The following bridge variables are now formalized for package consumers:

- renderer: `--mw-line-height`, `--mw-heading-line-height`
- editor: `--mwe-line-height`, `--mwe-gutter-width`

### Visual baselines in this checkpoint are static HTML evidence, not screenshot PNGs

The provided zip environment does not include a complete browser-driven screenshot lane.
This checkpoint therefore standardizes on repository-generated static HTML baseline pages for each selectable theme.

Those baselines are accepted for checkpoint evidence because they:

- inline the current source-line CSS
- apply the actual theme asset for each theme ID
- render representative header, action-rail, editor, preview, settings, status-bar, and syntax surfaces
- provide deterministic artifact hashing and manifest coverage

They are **not** treated as final pixel-regression evidence for release closure.
That harder browser/image lane remains a later release phase.

## Consequences

### Positive

- the active client selector surfaces now match the shipped theme asset set
- the portable contract now covers the editor/preview rhythm and mobile-width surfaces identified by the audit
- renderer/editor packages can now consume the missing line-height/gutter bridges without app-local assumptions
- the repository now contains deterministic visual-baseline artifacts for every selectable theme

### Remaining limits

This decision does **not** close:

- visible language-selection parity and broader core locale restoration
- final full frozen-target CommonMark/GFM corpus closure
- final browser-driven screenshot/pixel regression closure
- packed-artifact install evidence and promotion/release closure
- refreshed pack/publication artifacts for the new Phase 9 source line

## Evidence

This checkpoint is backed by:

- `node apps/client/tests/phase9-theme-parity.mjs --json`
- `npm run test -w @mdwrk/ui-tokens`
- `node tools/conformance/generate-phase9-theme-checkpoint.mjs`

The machine-readable outputs are:

- `artifacts/conformance/latest/phase-9-theme-parity-node-results.json`
- `artifacts/conformance/latest/phase-9-theme-parity-results.json`
- `artifacts/conformance/latest/phase-9-theme-parity-checkpoint.json`
- `artifacts/conformance/latest/phase-9-theme-visual-baselines.json`
- `artifacts/conformance/latest/phase-9-packed-example-smoke.json`
