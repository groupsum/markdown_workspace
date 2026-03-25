# @mdwrk/extension-runtime

Portable extension runtime for Markdown Workspace hosts.

This package provides:
- bundled extension registration
- external catalog registration and loading
- manifest validation
- compatibility checks
- persisted enabled/config/install state with deterministic namespaced keys
- activation and deactivation lifecycle management
- capability-scoped host wrappers
- runtime diagnostics and state snapshots
- signed-manifest verification
- module integrity verification
- install/update/remove flows for external extensions
- installed extension cache rehydration

## Public runtime surface

The runtime exposes methods for:
- registering bundled entries
- registering or loading catalogs
- listing available catalog entries
- installing, updating, and removing external extensions
- enabling/disabling and activating/deactivating extensions
- reading configuration stores and runtime services

## Current status

Implemented through Phase 13.

The package is publishable and includes the formal third-party catalog installer/runtime path described in the repository architecture docs.
Production deployments should still use managed signing keys and hosted catalog infrastructure rather than the development sample signer generated in checkpoint tooling.
