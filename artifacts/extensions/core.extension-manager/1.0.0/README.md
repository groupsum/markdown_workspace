# @mdwrk/extension-manager

First-party bundled operator console extension for Markdown Workspace.

## Purpose

This package provides the initial Extension Manager experience required to prove the runtime platform with a real bundled extension.

It registers:
- an Extension Manager view
- an Extension Manager action-rail entry
- an open-manager command
- package-local locale catalogs for localized labels and UI text

The manager view shows:
- bundled and installed extension inventory
- enabled/disabled state
- activation mode and status
- compatibility state
- granted and missing capabilities
- runtime diagnostics and last-error data
- schema-driven settings forms for extensions that declare `settingsSchema`

## Public exports

- `createExtensionManagerBundledEntry()`
- `EXTENSION_MANAGER_EXTENSION_ID`
- `EXTENSION_MANAGER_VIEW_ID`
- `EXTENSION_MANAGER_COMMAND_ID`
- `extensionManagerManifest`
- `extensionManagerLabels`
- `extensionManagerLocaleLoader`

## Current status

Implemented through Phase 13.

This package is publishable and intended for first-party bundling. It can visualize installed external extensions once present in the runtime. Broader interactive catalog-management UI can be layered on top of the runtime APIs without changing the extension contract surface.
