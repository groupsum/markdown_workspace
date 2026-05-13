# @mdwrk/extension-manager

[![Hits](https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.artifacts.extensions.core_extension_manager.v1_1_8.readme&left_text=hits)](https://github.com/groupsum/markdown_workspace/blob/master/artifacts/extensions/core.extension-manager/1.1.8/README.md)
[![Downloads](https://img.shields.io/npm/dm/%40mdwrk%2Fextension-manager?label=downloads)](https://www.npmjs.com/package/@mdwrk/extension-manager)

First-party bundled operator console extension for MdWrk.

## Manifest and compatibility

- manifest export: `./manifest`
- bundled entry export: `./bundled`
- compatibility declarations: host API, runtime, app, and theme contract ranges are declared in `src/manifest.ts`
- lifecycle model: bundled first-party extension activated through `@mdwrk/extension-runtime`

## Capabilities

The extension manager visualizes extension runtime state and operator metadata, including:

- bundled and installed extension inventory
- enabled / disabled state
- activation mode and activation status
- compatibility state
- granted and missing capabilities
- runtime diagnostics and last-error state
- schema-driven settings forms for extensions that declare `settingsSchema`

## Settings schema

The package now contributes its own settings section and manifest-backed settings schema.
Those settings cover manager-view defaults such as search, compatibility visibility, and diagnostics display preferences.

Source anchors:

- `src/manifest.ts`
- `src/createExtensionManagerBundledEntry.tsx`

## i18n readiness

The package ships locale labels and locale loaders under:

- `src/i18n.ts`
- `src/locales/en.ts`
- `src/locales/es.ts`

All user-facing manifest/view/settings labels are `I18nLabel` descriptors.

## Lifecycle and host/runtime integration tests

- `tests/extension-manager.test.tsx` exercises the bundled entry, runtime wiring, and extension inventory/state rendering helpers

## Install / configuration guidance

This package is intended for first-party bundling into `apps/client`.
Once active, it becomes the operator console for extension/runtime inventory, compatibility state, diagnostics, and settings visibility.

## API/reference docs

See the generated reference page at:

- `docs/reference/packages/mdwrk-extension-manager.md`
