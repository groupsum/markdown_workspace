# Extension runtime

## Purpose

The markdown workspace client supports a formal hosted extension system rather than ad hoc feature imports.

## Contract baseline established in Phase 2

Phase 2 implemented the contract packages that runtime and extension packages target:

- `@markdown-workspace/extension-manifest`
- `@markdown-workspace/extension-host`
- `@markdown-workspace/theme-contract`

By Phase 13, `@markdown-workspace/extension-manifest` also exports:
- catalog document contracts
- signed-manifest contracts
- trusted-signer contracts

## Host baseline established in Phase 6

Phase 6 refactored `apps/client` into an extension-ready host with registry-driven shell surfaces and host-safe adapters.

## Runtime package established in Phase 7 and extended in Phase 13

The runtime package is:

- `@markdown-workspace/extension-runtime`

It now provides:
- bundled extension registry
- external catalog registration and loading
- manifest validation
- host/runtime/theme compatibility checks
- activation/deactivation lifecycle management
- lazy/eager activation modes
- namespaced enabled-state and config persistence
- installed-extension metadata persistence
- installed-extension module cache persistence
- capability-scoped host access
- runtime diagnostics snapshots
- activation error containment
- signed-manifest verification
- integrity-checked ESM artifact installation
- update and removal flows for installed extensions
- cache rehydration for installed extensions on runtime boot

## Client integration established across Phases 7 through 13

`apps/client` boots an `ExtensionRuntimeProvider` that:
- constructs the runtime against the host adapters from Phase 6
- registers bundled extension catalog entries
- starts the runtime during client boot
- exposes a runtime diagnostics surface in settings

A bundled runtime smoke extension is included to prove:
- runtime-driven activation
- runtime-driven view registration
- runtime-driven action rail registration
- runtime-driven settings persistence

## Packaged Extension Manager established in Phase 8

Phase 8 adds:

- `@markdown-workspace/extension-manager`

This proves that the runtime can load a real packaged first-party extension that contributes:
- a view
- an action-rail entry
- runtime diagnostics
- schema-driven settings UI
- enable/disable and compatibility inspection surfaces

The manager already distinguishes bundled and installed runtime entries. In this checkpoint, external install/update/remove is primarily exercised through runtime APIs and conformance tooling.

## Storage model

Extension state is namespaced.

Implemented key patterns:
- `ext:<extension-id>:enabled`
- `ext:<extension-id>:config:<key>`
- `ext:<extension-id>:install:record`
- `ext:<extension-id>:install:module`
- `ext:install:index`

## Capability model

Extensions declare capabilities in the manifest.
The runtime intersects requested capabilities with host-granted capabilities and exposes only the granted set through the scoped host.

For external extensions, capability approval is layered with trust policy:
- allowlisted publisher/package/extension id checks
- signed-manifest verification against trusted public keys
- module integrity verification before execution

## External distribution model

Phase 13 formalizes the external distribution path:

1. an author publishes extension source as an npm package
2. CI builds browser-ready ESM artifact output under `artifacts/extensions/<id>/<version>/`
3. CI writes `manifest.json`, `signed-manifest.json`, `installable.json`, `integrity.json`, and `SHA256SUMS.txt`
4. CI publishes `catalog.json`, `public-signers.json`, and a sample trust-policy document
5. the runtime loads a catalog entry, validates trust, verifies integrity/signature, caches the module text, and registers the installed extension as source `installed`

## Runtime install/update/remove behavior

Implemented runtime API surface:
- `registerCatalog()`
- `loadCatalog()`
- `listAvailableCatalogEntries()`
- `installFromCatalogEntry()`
- `updateFromCatalogEntry()`
- `removeInstalledExtension()`

Installed extensions are rehydrated from cache on runtime start.

## Diagnostics model

The runtime exposes:
- enable/disable state
- activation mode
- compatibility state
- last activation time
- last error
- runtime diagnostic records
- missing host capabilities
- available external catalog entries and trust-policy issues

## Current implementation boundary

Phase 13 completes the internal extension-platform implementation plan, including third-party artifact distribution and certification tooling.

This repository checkpoint still does **not** claim independent external certification or production-signing-key custody. It is an internally completed checkpoint with generated evidence and explicit remaining limitations documented in the conformance and current-state docs.
