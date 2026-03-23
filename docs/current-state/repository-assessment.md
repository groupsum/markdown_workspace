# Repository assessment (Phase 13 checkpoint)

Date: 2026-03-22

## Scope

This assessment reviews the repository state contained in the current zip checkpoint.

## Current repository shape

The repository is a root npm workspace with:

- `apps/client/`
- `apps/lander/`
- contract packages under `packages/contracts/`
- shared primitive packages under `packages/shared/`
- renderer packages under `packages/renderer/`
- editor packages under `packages/editor/`
- extension packages under `packages/extensions/`
- examples under `examples/`
- root documentation, ADRs, conformance material, and operations docs under `docs/`
- generated CI, conformance, extension-artifact, and release-evidence outputs under `artifacts/`
- root workflow automation under `.github/workflows/`
- root operational tooling under `tools/`

## What changed in Phase 13

This checkpoint implements third-party extension distribution and certification tooling.

Implemented in this phase:
- runtime catalog registration and catalog loading support
- runtime install/update/remove flows for external extensions
- installed extension cache persistence and rehydration
- signed manifest contract types
- catalog contract types
- trusted signer contract types
- signed-manifest verification and module integrity verification
- sample trust policy document generation
- public signer document generation
- extension artifact validation integrated into conformance
- sample external extension package:
  - `@demo-markdown-workspace/extension-catalog-hello`
- generated external extension artifact catalog and signed artifacts under `artifacts/extensions/`
- extension certification checklist and third-party authoring documentation

## Current packages and applications

### Applications
- `apps/client/` — implemented application and publishable app package; consumes bundled extension packages through the workspace runtime host
- `apps/lander/` — implemented application consuming shared renderer packages and participating in root CI/conformance

### Contract packages
Implemented and publishable:
- `@markdown-workspace/extension-manifest`
- `@markdown-workspace/extension-host`
- `@markdown-workspace/theme-contract`

### Shared packages
Implemented and publishable:
- `@markdown-workspace/ui-tokens`
- `@markdown-workspace/icons`
- `@markdown-workspace/i18n`
- `@markdown-workspace/testing`

### Renderer packages
Implemented and publishable:
- `@markdown-workspace/markdown-renderer-core`
- `@markdown-workspace/markdown-renderer-react`

### Editor packages
Implemented and publishable:
- `@markdown-workspace/markdown-editor-core`
- `@markdown-workspace/markdown-editor-react`

### Extension packages
Implemented and publishable:
- `@markdown-workspace/extension-runtime`
- `@markdown-workspace/extension-manager`
- `@markdown-workspace/extension-gemini-agent`
- `@markdown-workspace/extension-theme-studio`
- `@demo-markdown-workspace/extension-catalog-hello`

## Capabilities now present

The current repo now has:

- workspace package topology with documented contracts
- reusable contract, shared, renderer, and editor families
- a packaged extension runtime with bundled and external-extension support
- packaged first-party bundled extensions
- a sample third-party external extension package
- root CI/CD workflow scaffolding for package-platform operation
- root conformance evidence generation
- dry-run package pack evidence generation
- browser-installable extension ESM artifact generation
- signed manifest generation for external artifacts
- extension integrity metadata generation
- trust-policy and public-signer artifacts
- conformance validation for extension artifacts
- release evidence generation and optional GitHub release workflow

## Verification performed for this checkpoint

Verified directly for this checkpoint:
- `npm run test -w @markdown-workspace/extension-runtime`
- `npm run test -w @demo-markdown-workspace/extension-catalog-hello`
- `npm pack --dry-run -w @markdown-workspace/extension-runtime`
- `npm pack --dry-run -w @demo-markdown-workspace/extension-catalog-hello`
- `node tools/extensions/build-installable-extensions.mjs`
- `node tools/extensions/sign-extension-artifacts.mjs`
- `node tools/conformance/validate-extension-artifacts.mjs`
- `node tools/conformance/generate-conformance-artifacts.mjs`

Verification limits in this checkpoint:
- full root `npm ci` / full root `npm run build` / full root `npm run test` were not re-executed in this container
- publish workflows were authored but not executed against npm/GitHub from this container
- the client runtime API supports external installs, but the client UI catalog-management surface remains narrower than the runtime API itself
- browser-driven E2E and pixel-level visual regression remain lighter-weight than a final certification-grade suite

## Main remaining gaps

### Certification and audit gaps
- no independent external certification body has evaluated this checkpoint
- no specific RFC corpus was supplied and audited end-to-end against the repository
- production signing-key custody and rotation are not exercised in this container checkpoint

### Product hardening gaps
- external catalog browsing/install UX in the client is still less complete than the runtime/tooling path
- full browser automation and pixel-diff regression remain future hardening work

## Phase 13 completion statement

This checkpoint completes the internal implementation plan for third-party extension distribution and certification tooling.

## Certification state at this checkpoint

This repository is **not yet independently certifiably fully featured** and **not yet independently certifiably fully RFC compliant**.

Reasons:
- no external independent certification was performed
- no formal RFC target set was defined and audited end-to-end
- production signing infrastructure and broad client UX hardening remain beyond this checkpoint

## Immediate next step after this checkpoint

The next work should focus on production hardening rather than foundational architecture:
- richer client UI for external catalog browsing/install/remove
- target-environment publish/deploy rehearsals
- browser-driven E2E expansion
- pixel-diff visual regression
- external audit/certification against a declared standard set
