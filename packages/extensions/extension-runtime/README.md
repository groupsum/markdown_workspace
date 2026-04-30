# @mdwrk/extension-runtime

Portable extension runtime for MdWork hosts.

## Runtime responsibilities

- bundled extension registration
- external catalog registration and loading
- manifest validation and compatibility checks
- persisted enabled/config/install state with deterministic namespaced keys
- activation and deactivation lifecycle management
- capability-scoped host wrappers
- runtime diagnostics and state snapshots
- signed-manifest verification and integrity checks
- install / update / remove flows for external extensions
- installed extension cache rehydration

## Public API surface

The runtime exposes methods for:

- registering bundled entries
- registering or loading catalogs
- listing available catalog entries
- installing, updating, and removing external extensions
- enabling/disabling and activating/deactivating extensions
- reading configuration stores and runtime services

## Compatibility declarations

This package depends on the contract packages rather than app internals:

- `@mdwrk/extension-host`
- `@mdwrk/extension-manifest`
- `@mdwrk/theme-contract`

## Lifecycle and integration tests

- `tests/runtime.test.ts` covers lifecycle, install/cache, compatibility, and state-management behavior
- `tests/run-smoke.mjs` covers runtime exports and smoke-level integration
- `tests/prepare-workspace-links.mjs` keeps workspace package links usable for package-local test execution

## Install / host integration guidance

Hosts should provide the runtime with:

- a compliant host API implementation from `@mdwrk/extension-host`
- a registration sink that maps runtime registrations onto host surfaces
- a storage adapter for config/install state
- trust/signing policy for external catalog flows

## API/reference docs

See the generated reference page at:

- `docs/reference/packages/mdwrk-extension-runtime.md`
