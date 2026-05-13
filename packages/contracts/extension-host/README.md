# mdwrk/extension-host

[![Hits](https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.packages.contracts.extension_host.readme&left_text=hits)](https://github.com/groupsum/markdown_workspace/blob/master/packages/contracts/extension-host/README.md)
[![Downloads](https://img.shields.io/npm/dm/%40mdwrk%2Fextension-host?label=downloads)](https://www.npmjs.com/package/@mdwrk/extension-host)

Stable host API, lifecycle, context, and registration contracts for MdWrk extensions.

## Package purpose

This package is the extension-facing boundary for interacting with the host application.

## What it exports

- host API contracts
- extension context contract
- lifecycle contracts
- primitive utility types
- registration contracts for commands, views, components, settings sections, and action rail items
- i18n catalog and locale-loader registration contracts
- theme inspection, bridge, preview, and CSS export contracts

## Authoring rule

Extension packages must use this package rather than importing `apps/client/*` internals directly.

## Important Phase 9 APIs

### i18n
Use:
- `context.registerLocaleCatalog(...)`
- `context.registerLocaleCatalogLoader(...)`
- `host.i18n.ensureLocale()`
- `host.i18n.format(...)`

### theme
Use:
- `host.theme.getTokenMap()`
- `host.theme.getThemeBridge(target)`
- `host.theme.getThemeBridgeVariables(target)`
- `host.theme.previewTheme(...)`
- `host.theme.applyDraft()`
- `host.theme.exportThemeCss(...)`

## Build

```bash
npm run build -w @mdwrk/extension-host
```

## Publishability

This package is structured as a standalone publishable npm package with typed exports. Build output is generated under `dist/` and is intentionally not committed.
