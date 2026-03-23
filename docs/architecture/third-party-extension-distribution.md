# Third-party extension distribution

## Purpose

This document defines the Phase 13 external extension distribution model for Markdown Workspace.

## Core distinction

Browser hosts do **not** run `npm install` at runtime.

Instead:
- authors publish source packages to npm
- CI builds browser-installable ESM artifacts from those source packages
- CI signs the manifest and emits integrity metadata
- the client/runtime installs those artifacts via a catalog/manifest flow

## Artifact set

Each external extension artifact directory contains:
- `manifest.json`
- `signed-manifest.json`
- `installable.json`
- `integrity.json`
- `SHA256SUMS.txt`
- `dist/`

Workspace-level distribution metadata includes:
- `artifacts/extensions/catalog.json`
- `artifacts/extensions/index.json`
- `artifacts/extensions/public-signers.json`
- `artifacts/extensions/trust-policy.sample.json`

## Catalog format

The catalog document identifies installable entries with:
- `entryId`
- `extensionId`
- `packageName`
- `version`
- localized labels and descriptions
- capability and compatibility declarations
- URLs for the manifest, signed manifest, module, and integrity documents
- integrity digests for manifest and module payloads

## Signed manifest format

The signed manifest wraps the extension manifest and includes:
- `schemaVersion`
- canonicalized manifest payload
- signature descriptor with:
  - `keyId`
  - `algorithm`
  - `signature`
  - `signedAt`

Current checkpoint algorithm:
- `ecdsa-p256-sha256`

## Trust model

The runtime evaluates a trust policy before installing an external extension.

Trust policy fields include:
- `allowUnsigned`
- `allowIntegrityOnly`
- `allowedPublishers`
- `allowedPackageNames`
- `allowedExtensionIds`
- `trustedSigners`

The sample checkpoint policy is intentionally strict:
- unsigned manifests are rejected
- integrity-only installs are rejected
- publisher/package/extension-id allowlists are enforced
- the signer must be present in the trusted signer set

## Install flow

1. register or load a catalog
2. select a catalog entry by `entryId`
3. fetch `signed-manifest.json`
4. fetch and compare `manifest.json` when present
5. verify manifest signature against trusted signers
6. fetch module text
7. verify module digest
8. evaluate compatibility
9. persist installed record and cached module text
10. register the installed extension with runtime source `installed`
11. optionally activate immediately

## Update flow

Update reuses the install path with a newer catalog entry version.
The runtime overwrites the cached module and installed record while preserving install history timestamps where appropriate.

## Remove flow

Remove:
- deactivates the installed extension if active
- unregisters it from the runtime registry
- removes install record and cached module text
- updates the install index

Bundled extensions cannot be removed through this path.

## Cache and rehydration

Installed external extensions are stored under namespaced runtime keys and are rehydrated on runtime startup.
This allows external extensions to survive reloads without re-fetching the catalog artifact immediately.

## Sample external extension

This checkpoint includes:
- source package: `packages/extensions/extension-catalog-hello/`
- generated catalog entry: `external.catalog-hello@1.0.0`

It proves:
- source-package authoring
- build output
- signed-manifest generation
- catalog discovery
- runtime installation
- activation
- cache rehydration
- removal

## Current implementation limit

The formal install/update/remove path is implemented and tested through the runtime APIs and artifact tooling.
The client UI surface for broad catalog browsing remains narrower than the runtime API surface in this checkpoint.
