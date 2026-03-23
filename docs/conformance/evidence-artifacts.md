# Conformance evidence artifacts

Date: 2026-03-22

## Purpose

This document enumerates the generated evidence artifacts produced by the Phase 13 conformance and release pipeline.

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

## Current evidence character

The evidence in this checkpoint is real generated static evidence.
It is sufficient for repository checkpointing and operational review.
It is not yet final independent certification evidence because:
- browser-driven E2E is still lighter than a final end-user certification suite
- pixel-level visual regression is still lighter than a final design-regression program
- live hosted catalog publication and production key custody were not exercised in this container
- no independent RFC audit body was involved
