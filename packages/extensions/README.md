# Extension packages

This package family contains the runtime, first-party extension packages, and a sample third-party external extension package for Markdown Workspace.

## Current packages

- `packages/extensions/extension-runtime/` — shared runtime for bundled and external extensions
- `packages/extensions/extension-manager/` — first-party operator console extension
- `packages/extensions/extension-gemini-agent/` — first-party AI workflow extension
- `packages/extensions/extension-theme-studio/` — first-party theme authoring extension
- `packages/extensions/extension-catalog-hello/` — sample third-party external extension package used to validate the formal catalog path

## Phase 11 documentation/evidence status

Each extension package now has:

- a package README
- generated API/reference docs under `docs/reference/packages/`
- manifest/compatibility evidence in the Phase 11 package matrix
- lifecycle/integration test evidence in the Phase 11 package artifact set

## Reference docs

- `docs/reference/workspace-package-certification-matrix.md`
- `docs/reference/package-boundary-map.md`
