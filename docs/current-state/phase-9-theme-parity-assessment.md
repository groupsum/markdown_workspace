# Phase 9 theme inventory, token contract, and visual parity assessment

Date: 2026-03-28
Checkpoint type: executable theme parity checkpoint built on the Phase 0 through Phase 8 baselines

## What this checkpoint completes

This checkpoint completes a **substantive Phase 9 visual/UI token update** for the current v2 repository.

The repository now has:

- twelve selectable themes in the active client selector surfaces
- closure of the seven previously hidden-but-shipped theme IDs
- a formalized portable contract for the missing editor/preview rhythm and mobile-width tokens
- renderer/editor bridge-variable closure for line-height and gutter-width alignment
- responsive small-layout rules that consume the restored mobile-width tokens
- static HTML visual baselines for every selectable theme
- machine-readable Phase 9 evidence artifacts

## Executed evidence in this checkpoint

The following commands were run successfully in the checkpoint zip:

- `node apps/client/tests/phase9-theme-parity.mjs --json`
- `npm run test -w @mdwrk/ui-tokens`
- `node tools/conformance/generate-phase9-theme-checkpoint.mjs`

Recorded results are captured in:

- `artifacts/conformance/latest/phase-9-theme-parity-node-results.json`
- `artifacts/conformance/latest/phase-9-theme-parity-results.json`
- `artifacts/conformance/latest/phase-9-theme-parity-checkpoint.json`
- `artifacts/conformance/latest/phase-9-theme-parity-output.txt`
- `artifacts/conformance/latest/phase-9-ui-tokens-test-output.txt`
- `artifacts/conformance/latest/phase-9-theme-visual-baselines.json`
- `artifacts/conformance/latest/phase-9-packed-example-smoke.json`

## What materially changed

### Theme inventory
The selector surfaces now expose every shipped theme asset.
The restored theme IDs are:

- `research-science`
- `ferrous-monolith`
- `tensioned-technical-skeleton`
- `optical-vellum-drafting-grid`
- `heavy-gauge-tectonic`
- `galvanized-cellular`
- `pressed-chromium`

### Token contract and bridges
The portable theme contract now includes the previously missing rhythm and responsive-width surfaces.
That means downstream packages no longer need to assume those values exist only as app-local CSS.

The active contract/package line now reflects:

- `@mdwrk/theme-contract@1.1.0`
- `@mdwrk/ui-tokens@1.2.0`

### Visual evidence
This checkpoint now generates one deterministic static HTML visual baseline page per selectable theme.
Each baseline page includes representative:

- header
- action rail
- editor surface
- preview surface
- status bar
- settings/theme-selection surface
- syntax-highlight sample

That is enough to checkpoint theme parity honestly in the provided environment.
It is not yet the same as a final browser screenshot or pixel-diff release gate.

## What this checkpoint does not complete

This checkpoint still does **not** complete:

- visible language-selection parity
- broader core locale restoration
- final full frozen-target CommonMark/GFM corpus closure
- final browser-driven screenshot/pixel regression closure
- packed-artifact and promotion/release closure

The repository therefore remains short of final certification even though the Phase 9 theme/token lane is now materially closed.

## Honest current status

This updated v2 checkpoint is a valid **Phase 9 theme inventory, token contract, and visual parity checkpoint**.

It is **not yet**:

- certifiably fully featured
- repository-internally RFC compliant across the full frozen boundary
- fully Markdown spec compliant across the full frozen CommonMark/GFM target

The repository is again materially stronger and less ambiguous than it was in Phase 8, but this checkpoint should still be treated as a **checkpointed partial closure**, not as final certification.
