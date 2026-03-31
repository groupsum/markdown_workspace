# Conformance evidence artifacts

Date: 2026-03-28

## Purpose

This document enumerates the generated evidence artifacts currently present in the repository for checkpointing, conformance review, extension distribution, and release preparation.

## Evidence locations

### CI
- `artifacts/ci/matrices.json`
- `artifacts/ci/integration-smoke.json`
- `artifacts/ci/e2e-smoke.json`
- `artifacts/ci/visual-smoke.json`

### Conformance
- `artifacts/conformance/latest/extension-manifest-validation.json`
- `artifacts/conformance/latest/compatibility-matrix.json`
- `artifacts/conformance/latest/package-boundary-report.json`
- `artifacts/conformance/latest/package-export-report.json`
- `artifacts/conformance/latest/package-inventory.json`
- `artifacts/conformance/latest/extension-catalog.json`
- `artifacts/conformance/latest/extension-artifact-validation.json`
- `artifacts/conformance/latest/extension-artifact-integrity.json`
- `artifacts/conformance/latest/extension-trust-policy.json`
- `artifacts/conformance/latest/conformance-status.json`
- `artifacts/conformance/latest/phase-0-certification-freeze.json`
- `artifacts/conformance/latest/phase-1-release-train-freeze.json`
- `artifacts/conformance/latest/package-release-matrix.json`
- `artifacts/conformance/latest/phase-1-package-graph-audit.json`
- `artifacts/conformance/latest/phase-2-renderer-commonmark-checkpoint.json`
- `artifacts/conformance/latest/phase-2-commonmark-subset-results.json`
- `artifacts/conformance/latest/phase-3-gfm-default-profile-checkpoint.json`
- `artifacts/conformance/latest/phase-3-gfm-default-profile-results.json`
- `artifacts/conformance/latest/phase-4-optional-profiles-checkpoint.json`
- `artifacts/conformance/latest/phase-4-optional-profiles-results.json`
- `artifacts/conformance/latest/phase-5-editor-core-results.json`
- `artifacts/conformance/latest/phase-5-editor-react-results.json`
- `artifacts/conformance/latest/phase-5-editor-authoring-results.json`
- `artifacts/conformance/latest/phase-5-editor-authoring-checkpoint.json`
- `artifacts/conformance/latest/phase-5-client-typecheck.txt`
- `artifacts/conformance/latest/phase-6-preview-export-checkpoint.json`
- `artifacts/conformance/latest/phase-6-preview-export-results.json`
- `artifacts/conformance/latest/phase-7-shell-parity-checkpoint.json`
- `artifacts/conformance/latest/phase-7-shell-parity-results.json`
- `artifacts/conformance/latest/phase-7-shell-parity-node-results.json`
- `artifacts/conformance/latest/phase-7-shell-parity-output.txt`
- `artifacts/conformance/latest/phase-8-settings-data-git-checkpoint.json`
- `artifacts/conformance/latest/phase-8-settings-data-git-results.json`
- `artifacts/conformance/latest/phase-8-settings-data-git-node-results.json`
- `artifacts/conformance/latest/phase-8-settings-data-git-output.txt`
- `artifacts/conformance/latest/phase-9-theme-parity-checkpoint.json`
- `artifacts/conformance/latest/phase-9-theme-parity-results.json`
- `artifacts/conformance/latest/phase-9-theme-parity-node-results.json`
- `artifacts/conformance/latest/phase-9-theme-parity-output.txt`
- `artifacts/conformance/latest/phase-9-ui-tokens-test-output.txt`
- `artifacts/conformance/latest/phase-9-theme-visual-baselines.json`
- `artifacts/conformance/latest/phase-9-packed-example-smoke.json`
- `artifacts/conformance/latest/phase-9-theme-baselines/`
- `artifacts/conformance/latest/phase-10-i18n-checkpoint.json`
- `artifacts/conformance/latest/phase-10-i18n-results.json`
- `artifacts/conformance/latest/phase-10-i18n-parity-node-results.json`
- `artifacts/conformance/latest/phase-10-i18n-parity-output.txt`
- `artifacts/conformance/latest/phase-10-i18n-test-output.txt`
- `artifacts/conformance/latest/phase-11-package-evidence.json`
- `artifacts/conformance/latest/phase-11-package-evidence-node-results.json`
- `artifacts/conformance/latest/phase-12-closure-suite-checkpoint.json`
- `artifacts/conformance/latest/phase-12-closure-suite-results.json`
- `artifacts/conformance/latest/phase-12-release-evidence-bundle-manifest.json`
- `artifacts/conformance/latest/phase-12-commonmark-corpus-summary.json`
- `artifacts/conformance/latest/phase-12-gfm-corpus-summary.json`
- `artifacts/conformance/latest/phase-12-optional-profile-lanes.json`
- `artifacts/conformance/latest/phase-12-preview-export-lane.json`
- `artifacts/conformance/latest/phase-12-browser-matrix-report.json`
- `artifacts/conformance/latest/phase-12-visual-regression-report.json`
- `artifacts/conformance/latest/phase-12-packed-tarball-install-report.json`
- `artifacts/conformance/latest/phase-12-packed-tarball-install-log.txt`
- `artifacts/conformance/latest/phase-12-extension-compatibility-manifest.json`
- `artifacts/conformance/latest/phase-12-changeset-version-inventory.json`
- `artifacts/conformance/latest/phase-12-release-notes-draft.md`
- `artifacts/conformance/latest/phase-12-certification-checklist.md`
- `artifacts/conformance/latest/phase-12-snapshot-manifests.json`
- `artifacts/conformance/latest/phase-12-conformance-command-output.txt`

### Extension distribution
- `artifacts/extensions/index.json`
- `artifacts/extensions/catalog.json`
- `artifacts/extensions/public-signers.json`
- `artifacts/extensions/trust-policy.sample.json`
- `artifacts/extensions/<extension-id>/<version>/manifest.json`
- `artifacts/extensions/<extension-id>/<version>/signed-manifest.json`
- `artifacts/extensions/<extension-id>/<version>/installable.json`
- `artifacts/extensions/<extension-id>/<version>/integrity.json`
- `artifacts/extensions/<extension-id>/<version>/SHA256SUMS.txt`
- `artifacts/extensions/<extension-id>/<version>/dist/`

### Release evidence
- `artifacts/packs/pack-report.json`
- `artifacts/releases/latest/release-evidence.json`
- `artifacts/releases/promotion-rc.1/`

## Current evidence character

The evidence in this checkpoint is real generated or repository-authored static evidence.
It is sufficient for repository checkpointing and operational review.

This repository now includes the Phase 0 target-freeze artifact, the Phase 1 release-train artifact, the Phase 2 CommonMark-core renderer artifact, the Phase 3 default-GFM artifact, the Phase 4 optional-profile artifact, the Phase 5 editor-authoring artifact, the Phase 6 preview/export/render-policy artifact, the Phase 7 shell parity artifact, the Phase 8 settings/data/session/Git parity artifact, the Phase 9 theme/token/visual parity artifact, the Phase 10 i18n/language-UX/catalog-coverage artifact, the Phase 11 package/app/example evidence artifact, the Phase 12 strict closure-suite artifact, the Phase 13 RC-train artifact, the Phase 14 promotion/release artifact, the Phase 15 post-release stabilization/support-window artifact, the Phase 16 certification-gate/promotion-gate policy-correction artifact, and the Phase 17 Gate B certification-closure rerun artifact, but it is still not final certification evidence because:
- frozen-target CommonMark/GFM corpus closure is not yet demonstrated end-to-end
- browser-driven E2E is still lighter than a final end-user certification suite
- the Phase 9 checkpoint now provides static HTML visual baselines, but browser-captured pixel-level visual regression is still lighter than a final design-regression program
- live hosted catalog publication and production key custody were not exercised in this container
- no independent external certification body was involved

## Phase 15 support-window artifacts

- `artifacts/conformance/latest/phase-15-stabilization-checkpoint.json`
- `artifacts/conformance/latest/phase-15-stabilization-results.json`
- `artifacts/conformance/latest/phase-15-support-window-policy.json`
- `artifacts/conformance/latest/phase-15-monitoring-matrix.json`
- `artifacts/conformance/latest/phase-15-evidence-integrity-manifest.json`
- `artifacts/conformance/latest/phase-15-follow-on-roadmap.md`
- `artifacts/conformance/latest/phase-15-minimum-closure-checklist.md`
- `artifacts/releases/support-window-rc.1/`
- `artifacts/conformance/latest/phase-16-certification-gate-checkpoint.json`
- `artifacts/conformance/latest/phase-16-certification-gate-results.json`
- `artifacts/conformance/latest/phase-16-closure-policy.json`
- `artifacts/conformance/latest/phase-16-certification-gate-checklist.md`
- `artifacts/conformance/latest/phase-16-promotion-gate-checklist.md`
- `artifacts/conformance/latest/phase-16-final-closure-sequence.md`
- `artifacts/conformance/latest/phase-17-certification-gate-checkpoint.json`
- `artifacts/conformance/latest/phase-17-certification-gate-results.json`
- `artifacts/conformance/latest/phase-17-certification-gate-checklist.md`
- `artifacts/conformance/latest/phase-17-commonmark-official-summary.json`
- `artifacts/conformance/latest/phase-17-gfm-official-summary.json`
- `artifacts/conformance/latest/phase-17-optional-profile-summary.json`
- `artifacts/conformance/latest/phase-17-browser-matrix-report.json`
- `artifacts/conformance/latest/phase-17-visual-regression-report.json`
- `artifacts/conformance/latest/phase-17-packed-release-set-install-report.json`
- `artifacts/conformance/latest/phase-17-packed-release-set-install-log.txt`
- `artifacts/conformance/latest/phase-17-evidence-bundle-manifest.json`
- `artifacts/conformance/latest/phase-17-gate-b-output.txt`
