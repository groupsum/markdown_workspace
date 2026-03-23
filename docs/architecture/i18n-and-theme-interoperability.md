# i18n and theme interoperability

## Purpose

This document describes the Phase 9 interoperability baseline for localization and theming across apps, reusable packages, and extensions.

## i18n interoperability model

The normative pieces are:
- `@markdown-workspace/extension-manifest` for keyed `I18nLabel` descriptors
- `@markdown-workspace/extension-host` for host i18n registration and locale loading
- `@markdown-workspace/i18n` for locale registries, fallback chains, namespaced catalogs, and loader helpers

### Required extension behavior

Extensions should:
- give user-visible manifest labels stable `key` values
- register locale catalogs or locale catalog loaders through `ExtensionContext`
- use host formatting for all user-visible UI labels
- keep message keys namespaced to the extension id

### Locale loading model

The host now supports package-local loader registration.
An extension may register:
- a default locale
- a fallback locale
- locale-specific lazy loaders

The loader path is intended for:
- bundled first-party extensions with per-locale chunks
- future external extensions with packaged locale assets

### Fallback behavior

The shared i18n registry resolves locale chains in this order:
1. exact locale, e.g. `es-mx`
2. parent locale, e.g. `es`
3. fallback locale, e.g. `en`
4. default message on the label descriptor

## Theme interoperability model

The normative pieces are:
- `@markdown-workspace/theme-contract` for tokens, classes, and bridge definitions
- `@markdown-workspace/ui-tokens` for concrete token and bridge generation helpers
- renderer/editor React packages for host-token and bridge-based style helpers

### Required package behavior

Reusable renderer/editor packages should:
- depend only on the shared theme contract and bridge helpers
- avoid importing app-local stylesheets
- expose stable semantic classes
- consume standardized bridge variables

### Required host behavior

The client host now exposes theme APIs for extensions to:
- inspect canonical tokens
- inspect public classes
- inspect renderer/editor bridge definitions
- compute bridge variable records
- preview token changes
- apply or discard theme drafts
- export theme presets or CSS

## Current proof points in the repo

Phase 9 introduces or finalizes:
- package-local locale loader registration in the client i18n service
- host i18n adapter support for extension locale loaders
- keyed and localized labels in the packaged Extension Manager
- renderer/editor bridge definitions in `@markdown-workspace/theme-contract`
- bridge CSS generation helpers in `@markdown-workspace/ui-tokens`
- renderer/editor package helper exports that materialize bridge style objects from token overrides

## Remaining limitations

This interoperability baseline is real but not final certification evidence.
The repo still lacks:
- full third-party extension distribution and locale asset flow
- Gemini and Theme Studio packages
- complete workspace-wide CI evidence for all React package tests in this container
