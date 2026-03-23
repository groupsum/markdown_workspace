# Extension package layout

## Objective

All extension packages shall be npm packages and shall be publishable.

## Canonical layout

```text
packages/extensions/extension-gemini-agent/
  package.json
  README.md
  tsconfig.json
  src/
    index.ts
    manifest.ts
    activate.ts
    i18n/
      en.ts
    services/
    hooks/
    components/
    views/
    types/
  tests/
    manifest.test.ts
    activation.test.ts
    integration.test.tsx
```

## Required files

### `package.json`
Must declare:
- scoped package name
- semantic version
- package exports
- side effects policy
- peer dependencies as needed
- publish configuration
- repository metadata
- license metadata

### `src/index.ts`
The public package entry point.

### `src/manifest.ts`
The formal extension manifest.

### `src/activate.ts`
Runtime activation logic.

### `README.md`
Extension-specific usage, configuration, capability, and compatibility documentation.

### `tests/*`
Manifest, lifecycle, and integration tests.

## Export contract

Each extension package exports a runtime-consumable extension module.

Example shape:

```ts
export interface MarkdownWorkspaceExtension {
  manifest: ExtensionManifest;
  activate(ctx: ExtensionContext): Promise<void> | void;
  deactivate?(ctx: ExtensionContext): Promise<void> | void;
}
```

## What belongs in each directory

### `services/`
Extension-long-lived orchestration or client objects.

### `hooks/`
Extension-internal hooks only.

### `components/`
Reusable UI pieces inside the extension package.

### `views/`
Top-level extension views or panels.

### `i18n/`
Locale catalogs.

### `types/`
Extension-specific types that do not belong in host contracts.

## Package authoring rules

- extension packages must not import app internals directly
- extension packages consume host contracts from `@markdown-workspace/extension-host`
- extension packages consume manifest contracts from `@markdown-workspace/extension-manifest`
- styling must target the shared token/class contract, not app-local stylesheet internals
- all user-visible labels must be localizable
- all extensions must provide an icon descriptor

## Initial first-party package list

- `@markdown-workspace/extension-runtime`
- `@markdown-workspace/extension-manager`
- `@markdown-workspace/extension-gemini-agent`
- `@markdown-workspace/extension-theme-studio`
