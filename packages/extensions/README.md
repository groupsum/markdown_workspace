# Extension packages

This package family contains the runtime, first-party extension packages, and a sample third-party external extension package for Markdown Workspace.

## Current packages

- `packages/extensions/extension-runtime/` — shared runtime for bundled and external extensions
- `packages/extensions/extension-manager/` — first-party operator console extension
- `packages/extensions/extension-gemini-agent/` — first-party AI workflow extension
- `packages/extensions/extension-theme-studio/` — first-party theme authoring extension
- `packages/extensions/extension-catalog-hello/` — sample third-party external extension package used to validate the formal catalog path

## Current state

The runtime, Extension Manager, Gemini Agent, and Theme Studio packages are implemented.
Phase 13 adds:
- external catalog registration
- signed-manifest and integrity verification
- install/update/remove/cache flows for external extensions
- a sample external extension package and artifact set

The remaining work is now primarily production hardening and independent certification, not foundational package architecture.
