# markdown_workspace

`markdown_workspace` is a multi-package workspace for the Markspace client, lander, reusable markdown packages, extension contracts, first-party extension packages, third-party extension distribution tooling, and the repository operations layer required to run the codebase as a package platform.

## Repository structure

- `apps/` — deployable applications
- `packages/contracts/` — stable extension, catalog, signature, and theme contracts
- `packages/shared/` — shared tokens, icons, i18n, and testing primitives
- `packages/renderer/` — reusable markdown renderer packages
- `packages/editor/` — reusable markdown editor packages
- `packages/extensions/` — extension runtime, first-party extensions, and the sample external extension package
- `examples/` — integration examples for reusable packages
- `docs/` — ADRs, architecture docs, conformance docs, current-state assessments, and operational docs
- `tools/` — root operational tooling for matrices, conformance, extension artifacts, and release evidence
- `artifacts/` — generated evidence outputs included in this checkpoint zip

## Phase 13 checkpoint status

This checkpoint completes the **Phase 13 third-party extension distribution and certification** slice:

- signed extension catalog artifacts now exist for browser-installable external extensions
- the runtime can register catalogs, verify signed manifests and module integrity, enforce trust policy allowlists, install/update/remove external extensions, and rehydrate cached installs
- a sample external extension package now proves the end-to-end author → build → sign → catalog → install path
- conformance tooling now validates extension artifacts in addition to manifest, compatibility, boundary, and export rules

## Implemented packages

### Contracts
- `@markdown-workspace/extension-manifest`
- `@markdown-workspace/extension-host`
- `@markdown-workspace/theme-contract`

### Shared
- `@markdown-workspace/ui-tokens`
- `@markdown-workspace/icons`
- `@markdown-workspace/i18n`
- `@markdown-workspace/testing`

### Renderer
- `@markdown-workspace/markdown-renderer-core`
- `@markdown-workspace/markdown-renderer-react`

### Editor
- `@markdown-workspace/markdown-editor-core`
- `@markdown-workspace/markdown-editor-react`

### Extensions
- `@markdown-workspace/extension-runtime`
- `@markdown-workspace/extension-manager`
- `@markdown-workspace/extension-gemini-agent`
- `@markdown-workspace/extension-theme-studio`
- `@demo-markdown-workspace/extension-catalog-hello` — sample third-party external extension used to prove the formal catalog path

## Generated external-distribution artifacts

The checkpoint zip includes generated external-extension evidence under `artifacts/extensions/`:

- `catalog.json`
- `index.json`
- `public-signers.json`
- `trust-policy.sample.json`
- per-extension artifacts with `manifest.json`, `signed-manifest.json`, `installable.json`, `integrity.json`, `SHA256SUMS.txt`, and `dist/`

## Documentation

See `docs/README.md` for the current architecture, conformance, authoring, and operations document index.

## Current certification note

This repository is **not yet independently certified** as:
- certifiably fully featured
- certifiably fully RFC compliant

What this checkpoint does provide is a completed internal Phase 13 implementation with generated conformance evidence, signed external-extension artifacts, runtime install/update/remove flows, and explicit documentation of the current remaining limits.
