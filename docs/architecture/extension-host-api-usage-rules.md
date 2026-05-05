# Extension host API usage rules

## Purpose

This document defines how extension packages use host capabilities safely and portably.

The normative contract source is `mdwrk/extension-host`.

## Rule 1 — use host contracts, not app internals

Extension packages must consume:
- `mdwrk/extension-host`
- `mdwrk/extension-manifest`
- `mdwrk/theme-contract`

Extension packages must **not** import from:
- `apps/client/*`
- `apps/mdwrkcom/*`

## Rule 2 — register through `ExtensionContext`

Extensions register contributions through the context:

- `registerCommand(...)`
- `registerView(...)`
- `registerComponent(...)`
- `registerActionRailItem(...)`
- `registerSettingsSection(...)`
- `registerLocaleCatalog(...)`
- `registerLocaleCatalogLoader(...)`
- `registerService(...)`

The extension should retain no out-of-band registration channels.

## Rule 3 — respect declared capabilities

An extension may only rely on capabilities it declares in its manifest.

Examples:
- reading the current document requires `editor.read`
- modifying the document requires `editor.write`
- theme inspection requires `theme.read`
- theme preview/apply/export requires `theme.write`
- workspace mutation requires `workspace.write`

## Rule 4 — use namespaced configuration

Extensions persist configuration through `context.config`.
They must not write directly into host storage using ad hoc global keys.

## Rule 5 — localize all user-visible labels

All user-facing labels should be expressed as `I18nLabel` values or catalog-backed strings.
Extensions should register locale catalogs through the host i18n surface.

Preferred model:
- use manifest labels with stable `key` values
- use message keys prefixed by the extension id
- register locale loaders for per-locale package assets
- call `host.i18n.ensureLocale()` during activation when the extension depends on package-local catalogs

## Rule 6 — style against the theme contract

Extensions must style against the shared token, class, and bridge contract rather than app-local stylesheet assumptions.

See:
- `architecture/theme-token-and-class-contract.md`
- `architecture/theme-mapping-guide.md`
- `architecture/i18n-and-theme-interoperability.md`

## Rule 7 — use the host theme APIs instead of DOM patching

Extensions must use the host theme APIs to:
- inspect canonical token definitions
- inspect canonical class definitions
- inspect renderer/editor bridge variables
- preview or apply theme drafts
- export theme presets or CSS

Direct DOM mutation against undocumented CSS variables is not a supported extension mechanism.

## Rule 8 — publish diagnostics through the host

Extension failures and health information should be surfaced through the host diagnostics contract, not silent console-only failures.

## Rule 9 — prefer declarative contributions

Where possible, describe commands, views, settings sections, and rail entries in the manifest and register runtime implementations through the context.

## Rule 10 — avoid hidden host coupling

Extensions must not assume:
- private route ids
- undocumented global stores
- undocumented React providers
- DOM structure or CSS selectors outside the published contract

## Rule 11 — package boundaries are normative

A build that succeeds via forbidden deep imports still violates the architecture.
Package boundary compliance is part of repository-internal RFC compliance.
