# Package topology

## Decision summary

The repository is a root npm workspace with explicit application, package, documentation, and example boundaries.

## Current repository structure after Phase 3

```text
markdown_workspace/
  package.json
  package-lock.json
  tsconfig.base.json
  .github/
  docs/
  apps/
    client/
    lander/
  packages/
    contracts/
      extension-manifest/
      extension-host/
      theme-contract/
    shared/
    renderer/
    editor/
    extensions/
  examples/
  env/
```

## Package families

### Applications
Deployable products only.

- `apps/client`
- `apps/lander`

Applications may depend on packages. Packages may **not** depend on applications.

### Contracts
Normative interfaces and schemas.

- `@markdown-workspace/extension-manifest` — implemented
- `@markdown-workspace/extension-host` — implemented
- `@markdown-workspace/theme-contract` — implemented

These packages are intended to remain implementation-light and stable.

### Shared
Cross-cutting primitives that remain app-agnostic.

- `@markdown-workspace/ui-tokens`
- `@markdown-workspace/icons`
- `@markdown-workspace/i18n`
- `@markdown-workspace/testing`

Status in Phase 3: concrete shared packages are implemented and publishable.

### Renderer
Portable markdown rendering packages.

- `@markdown-workspace/markdown-renderer-core`
- `@markdown-workspace/markdown-renderer-react`

Status in Phase 3: family directory exists; concrete packages not yet implemented.

### Editor
Portable markdown editing packages.

- `@markdown-workspace/markdown-editor-core`
- `@markdown-workspace/markdown-editor-react`

Status in Phase 3: family directory exists; concrete packages not yet implemented.

### Extensions
Publishable extension packages and extension runtime.

- `@markdown-workspace/extension-runtime`
- `@markdown-workspace/extension-manager`
- `@markdown-workspace/extension-gemini-agent`
- `@markdown-workspace/extension-theme-studio`

Status in Phase 3: family directory exists; concrete packages not yet implemented.

## Naming rules

### npm scope
All new workspace packages use the npm scope:

- `@markdown-workspace/*`

### Path naming
Use lowercase kebab-case for package directories.

Examples:
- `packages/extensions/extension-runtime`
- `packages/renderer/markdown-renderer-react`

### Extension ids
Extension ids are stable dot-separated identifiers independent of folder names.

Examples:
- `core.extension-manager`
- `core.gemini-agent`
- `core.theme-studio`

## Ownership rules

- `apps/*` own product composition, routing, deployment, and end-user assembly.
- `packages/contracts/*` own normative interfaces and schemas.
- `packages/shared/*` own reusable primitives.
- `packages/renderer/*` own markdown rendering.
- `packages/editor/*` own markdown editing.
- `packages/extensions/*` own the extension runtime or extension packages.

## Import rules

### Allowed
- apps → packages
- package → package within allowed lower layers
- examples → packages

### Forbidden
- package → app
- app → app
- renderer/editor packages importing from extension packages
- shared packages importing from apps
- extension packages importing from app internals directly

## Phase 3 outcomes

Phase 3 extends the concrete package families under `packages/`:
- contract packages remain implemented and publishable
- shared packages are now implemented and publishable
- the client imports shared styling primitives from `@markdown-workspace/ui-tokens`
- token/class naming and theme mapping guidance now exist for package consumers
