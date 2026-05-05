# Phase 11 checkpoint summary

Date: 2026-03-28

This updated v2 zip is a **Phase 11 package documentation, examples, contract boundaries, and evidence checkpoint** built on top of:

- the Phase 0 certification-target freeze;
- the Phase 1 release-train and compatibility-baseline freeze;
- the Phase 2 renderer/CommonMark-core checkpoint;
- the Phase 3 default-GFM checkpoint;
- the Phase 4 optional-profile checkpoint;
- the Phase 5 editor semantics and authoring UX checkpoint;
- the Phase 6 preview/export/render-policy checkpoint;
- the Phase 7 shell parity checkpoint;
- the Phase 8 settings/data/session/Git parity checkpoint; and
- the Phase 9 theme inventory/token contract/visual parity checkpoint.

## Phase 11 artifacts present in this checkpoint

- `docs/adr/ADR-0018-package-documentation-examples-boundaries-and-evidence-phase11-checkpoint.md`
- `docs/conformance/package-documentation-phase11.md`
- `docs/current-state/phase-11-package-documentation-assessment.md`
- `docs/reference/workspace-package-certification-matrix.md`
- `docs/reference/workspace-reference-index.md`
- `docs/reference/package-boundary-map.md`
- `docs/apps/mdwrkspace-app.md`
- `docs/apps/mdwrkcom-app.md`
- `docs/examples/editor-basic-example.md`
- `docs/examples/renderer-basic-example.md`
- `docs/operations/release-evidence-phase11.md`
- `artifacts/conformance/latest/phase-11-package-evidence.json`
- `artifacts/conformance/latest/phase-11-package-evidence-output.txt`
- `artifacts/conformance/latest/phase-11-package-reference-index.json`
- `tools/conformance/generate-phase11-package-evidence.mjs`

## What this checkpoint materially adds

- a generated certification matrix across all workspace packages, apps, and examples
- generated API/reference pages for every workspace package/app/example in scope
- explicit package boundary evidence confirming that reusable packages do not import app-private code
- stronger extension-package README coverage for manifests, capabilities, settings schemas, i18n readiness, lifecycle tests, compatibility, and installation guidance
- explicit app-level docs for public config surfaces, dependency boundaries, release/deploy notes, conformance linkage, and support/ownership
- stronger example coverage showing that the examples validate public package APIs rather than private workspace wiring
- release-evidence documentation tying typed exports, scripts, checkpoint artifacts, and publishability evidence together

## Recorded Phase 11 evidence in the repo

The generated Phase 11 evidence matrix records:

- 20 workspace package/app/example entries audited
- 201 structural Phase 11 certification checks
- 201/201 checks passing in the checkpoint zip

## Honest current status

This checkpoint makes the repository **credibly certifiable** at the documentation/evidence layer.

It still does **not** yet mean the repository is:

- certifiably fully featured
- repository-internally RFC compliant across the full frozen boundary
- fully Markdown spec compliant across the entire frozen CommonMark/GFM target

The main remaining reasons are:

- final end-to-end frozen-target Markdown corpus closure still needs stronger release-grade evidence
- browser-driven visual regression and promotion/release closure are still ahead of this checkpoint
- this checkpoint focuses on package/app/example documentation, evidence, and boundary clarity rather than final public release promotion

## Start here

- `docs/current-state/phase-11-package-documentation-assessment.md`
- `docs/conformance/package-documentation-phase11.md`
- `docs/reference/workspace-package-certification-matrix.md`
- `artifacts/conformance/latest/phase-11-package-evidence.json`
- `docs/conformance/current-certification-status.md`
