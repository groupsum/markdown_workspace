# CI/CD pipeline

Date: 2026-03-22

## Purpose

This document defines the Phase 13 CI/CD baseline for `markdown_workspace` as a package platform.

## Root workflows

The repository includes the following root workflows:

- `ci.yml` — workspace linting, typechecking, package-group matrix verification, app matrix verification, integration smoke, end-to-end smoke, visual smoke, and conformance artifact upload
- `conformance.yml` — dedicated conformance/evidence workflow
- `publish-packages.yml` — Changesets-driven package version/publish workflow
- `publish-extensions.yml` — browser-installable extension artifact build, signing, integrity, and upload workflow
- `release.yml` — release evidence aggregation and optional GitHub release asset publication

Legacy app-specific workflows remain in `.github/workflows/` for deployment and targeted app build use cases.

## CI stages

### Workspace install
- `npm ci`

### Lint
- `npm run ci:lint`

### Typecheck
- `npm run ci:typecheck`

### Package-group matrix
- contracts
- shared
- renderer
- editor
- extensions

Each group runs lint, typecheck, build, and tests.

### App matrix
- `apps/client`
- `apps/lander`

Each app runs lint, typecheck, and build. The client app also runs its package tests.

### Integration smoke
- `npm run test:integration`

### End-to-end smoke
- `npm run test:e2e`

This checkpoint still uses structural E2E assertions instead of a full browser-driven automation suite.

### Visual smoke
- `npm run test:visual`

This checkpoint still uses deterministic asset digests as visual snapshot evidence.

### Conformance
- `npm run conformance`

This generates:
- extension manifest validation
- compatibility matrix
- package boundary report
- package export report
- extension artifact validation
- package inventory
- extension catalog
- conformance status

## Extension distribution stages

`publish-extensions.yml` and the root scripts execute:
- `npm run build:extensions`
- `npm run extension:bundle`
- `npm run extension:sign`
- `npm run validate:extension-artifacts`

Outputs include:
- external catalog entries
- signed manifests
- integrity manifests
- public signer metadata
- sample trust policy metadata

## Generated artifacts

Artifacts are written under `artifacts/`:

- `artifacts/ci/`
- `artifacts/conformance/latest/`
- `artifacts/extensions/`
- `artifacts/packs/`
- `artifacts/releases/latest/`

## Current limits

This Phase 13 checkpoint establishes the internal CI/CD and evidence path for third-party extension distribution, but it is not the final independently certified pipeline.

Current limits:
- full browser-driven E2E is not yet implemented
- pixel-level visual regression is not yet implemented
- production signing-key infrastructure is not exercised in this container
- end-to-end publish execution was not performed from this container against live registries/CDNs
