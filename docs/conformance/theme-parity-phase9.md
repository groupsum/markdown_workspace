# Phase 9 — theme inventory, token contract, and visual parity

Date: 2026-03-28
Checkpoint type: executable theme inventory / token contract / visual parity checkpoint

## Scope of this phase

This checkpoint closes the Phase 9 parity band identified by the v1→v2 audit:

- restore the seven shipped-but-unselectable themes to the active selector registry
- restore the missing rhythm and responsive-width tokens into the formal portable contract
- align renderer/editor bridge variables with the restored token set
- validate that selector surfaces match shipped assets
- generate deterministic visual-baseline artifacts for all selectable themes

## Restored selectable themes

The following themes are now restored to the active selector surfaces:

- `research-science`
- `ferrous-monolith`
- `tensioned-technical-skeleton`
- `optical-vellum-drafting-grid`
- `heavy-gauge-tectonic`
- `galvanized-cellular`
- `pressed-chromium`

Together with the already-exposed themes, the selectable inventory is now twelve themes total.

## Restored formal token surfaces

The Phase 9 contract now formally includes:

- `--editor-line-height`
- `--editor-line-rhythm`
- `--line-number-gutter-width`
- `--markdown-line-height`
- `--markdown-heading-line-height`
- `--mobile-rail-expanded-width`
- `--mobile-expandable-rail-width`

The Phase 9 bridge surfaces now formally include:

- renderer: `--mw-line-height`, `--mw-heading-line-height`
- editor: `--mwe-line-height`, `--mwe-gutter-width`

## Package/version movement in this checkpoint

This checkpoint materially changes the portable styling surface and therefore advances:

- `@mdwrk/theme-contract` → `1.1.0`
- `@mdwrk/ui-tokens` → `1.2.0`

The active client remains on `@mdwrk/mdwrkspace@1.4.0` in this checkpoint line.

## Executed evidence in this checkpoint

The following commands were executed in the checkpoint zip:

- `node apps/client/tests/phase9-theme-parity.mjs --json`
- `npm run test -w @mdwrk/ui-tokens`
- `node tools/conformance/generate-phase9-theme-checkpoint.mjs`

Recorded artifacts:

- `artifacts/conformance/latest/phase-9-theme-parity-node-results.json`
- `artifacts/conformance/latest/phase-9-theme-parity-results.json`
- `artifacts/conformance/latest/phase-9-theme-parity-checkpoint.json`
- `artifacts/conformance/latest/phase-9-theme-parity-output.txt`
- `artifacts/conformance/latest/phase-9-ui-tokens-test-output.txt`
- `artifacts/conformance/latest/phase-9-theme-visual-baselines.json`
- `artifacts/conformance/latest/phase-9-packed-example-smoke.json`
- `artifacts/conformance/latest/phase-9-theme-baselines/`

## Recorded results

This checkpoint records:

- 51/51 executable Phase 9 parity checks passing
- 18/18 structural Phase 9 audit checks passing
- 12/12 generated static HTML visual baselines present
- 3/3 structural smoke themes present for the default / research-science / high-contrast industrial subset

## Nature of the visual-baseline evidence

The visual baseline set in this checkpoint is intentionally explicit about its limits.

It is:

- real generated evidence inside the repository
- derived from current source-line CSS and theme assets
- representative of header, action-rail, editor, preview, settings, status-bar, and syntax surfaces
- deterministic and hashable

It is **not**:

- a browser-driven screenshot lane
- a pixel-level visual regression gate
- a substitute for final release-candidate image-diff evidence

The Phase 9 baseline therefore closes the structural/selector/theme-asset parity lane, while final browser screenshot closure remains a later release phase.

## What this checkpoint does not close

This Phase 9 checkpoint still does **not** close:

- visible language-selection parity and broader locale restoration
- final full frozen-target CommonMark/GFM corpus closure
- final browser/image regression closure
- packed-tarball install evidence and release promotion closure
- refreshed published extension/package artifact lines for the new Phase 9 source state

## Certification statement for this phase

This Phase 9 checkpoint is a real and useful checkpoint.
It closes the theme inventory, token contract, and visual parity lane identified by the audit.

It does **not** yet authorize the repository to claim that it is:

- certifiably fully featured
- repository-internally RFC compliant across the full frozen boundary
- fully Markdown spec compliant across the full frozen CommonMark/GFM target
