# Phase 9 checkpoint summary

Date: 2026-03-28

This updated v2 zip is a **Phase 9 theme inventory, token contract, and visual parity checkpoint** built on top of:

- the Phase 0 certification-target freeze;
- the Phase 1 release-train and compatibility-baseline freeze;
- the Phase 2 renderer/CommonMark-core checkpoint;
- the Phase 3 default-GFM checkpoint;
- the Phase 4 optional-profile checkpoint;
- the Phase 5 editor semantics and authoring UX checkpoint;
- the Phase 6 preview/export/render-policy checkpoint;
- the Phase 7 shell parity checkpoint; and
- the Phase 8 settings/data/session/Git parity checkpoint.

## Phase 9 artifacts present in this checkpoint

- `docs/adr/ADR-0016-theme-inventory-token-contract-and-visual-parity-phase9-checkpoint.md`
- `docs/conformance/theme-parity-phase9.md`
- `docs/current-state/phase-9-theme-parity-assessment.md`
- `artifacts/conformance/latest/phase-9-theme-parity-checkpoint.json`
- `artifacts/conformance/latest/phase-9-theme-parity-results.json`
- `artifacts/conformance/latest/phase-9-theme-parity-node-results.json`
- `artifacts/conformance/latest/phase-9-theme-parity-output.txt`
- `artifacts/conformance/latest/phase-9-ui-tokens-test-output.txt`
- `artifacts/conformance/latest/phase-9-theme-visual-baselines.json`
- `artifacts/conformance/latest/phase-9-packed-example-smoke.json`
- `artifacts/conformance/latest/phase-9-theme-baselines/`
- `tools/conformance/generate-phase9-theme-checkpoint.mjs`
- `apps/client/tests/phase9-theme-parity.mjs`

## What this checkpoint materially adds

- the seven previously shipped-but-unselectable themes are now restored to the active selector registry:
  - `research-science`
  - `ferrous-monolith`
  - `tensioned-technical-skeleton`
  - `optical-vellum-drafting-grid`
  - `heavy-gauge-tectonic`
  - `galvanized-cellular`
  - `pressed-chromium`
- the active client shell now exposes all twelve shipped theme assets through the project/theme selection surfaces instead of only five
- the formal theme contract now expands to `@mdwrk/theme-contract@1.1.0` so the previously app-local rhythm and responsive-width tokens become part of the portable contract surface
- `@mdwrk/ui-tokens` advances to `1.2.0` and now carries the restored rhythm/layout tokens through the shared token package plus renderer/editor bridge alignment
- responsive small-layout rules now consume the mobile rail width tokens instead of hard-coded values
- renderer and editor theme bridges now formally carry line-height and gutter-width variables for rhythm alignment
- the repository now carries static HTML visual baseline pages for all twelve selectable themes and a smoke manifest for the required default/research-science/high-contrast industrial subset

## Evidence captured in this checkpoint

Executed evidence in this checkpoint includes:

- `node apps/client/tests/phase9-theme-parity.mjs --json`
- `npm run test -w @mdwrk/ui-tokens`
- `node tools/conformance/generate-phase9-theme-checkpoint.mjs`

The generated artifacts record:

- 51/51 executable Phase 9 theme-parity checks passing
- 18/18 structural Phase 9 theme/token audit checks passing
- 12/12 static HTML visual baselines generated
- 3/3 structural smoke themes present in the baseline manifest

## Honest current status

This checkpoint closes a meaningful **Phase 9 theme inventory, token contract, and visual parity lane**.

It does **not** yet mean the repository is:

- certifiably fully featured
- repository-internally RFC compliant across the full frozen boundary
- fully Markdown spec compliant across the entire frozen CommonMark/GFM target

The main remaining reasons are:

- visible language-selection parity and broader core locale restoration are still open
- full frozen-target CommonMark/GFM corpus closure, browser-driven evidence, packed-artifact release evidence, and later RC/promotion phases are still ahead of this checkpoint
- the visual baselines in this checkpoint are repository-generated static HTML evidence pages, not browser-captured screenshot PNGs
- the package packs and published extension artifacts under `artifacts/packs/` and `artifacts/extensions/` have not been republished on a new release line for the Phase 9 source state

## Start here

- `docs/current-state/phase-9-theme-parity-assessment.md`
- `docs/conformance/theme-parity-phase9.md`
- `artifacts/conformance/latest/phase-9-theme-parity-checkpoint.json`
- `artifacts/conformance/latest/phase-9-theme-parity-results.json`
- `artifacts/conformance/latest/phase-9-theme-visual-baselines.json`
- `docs/conformance/current-certification-status.md`
