# Package topology

Date: 2026-03-27

## Decision summary

The repository is a root npm workspace with explicit application, package, documentation, artifact, and example boundaries.
Applications compose packages; packages do not depend on applications.

## Current repository structure

```text
markdown_workspace/
  package.json
  package-lock.json
  tsconfig.base.json
  .changeset/
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
      ui-tokens/
      icons/
      i18n/
      testing/
    renderer/
      markdown-renderer-core/
      markdown-renderer-react/
    editor/
      markdown-editor-core/
      markdown-editor-react/
    extensions/
      extension-runtime/
      extension-workspace-files/
      extension-git-ops/
      extension-manager/
      extension-gemini-agent/
      extension-theme-studio/
      extension-catalog-hello/
  examples/
    editor-basic/
    renderer-basic/
  tools/
  artifacts/
```

## Package families

### Applications
Deployable products only.

- `apps/client` → `@mdwrk/mdwrkspace`
- `apps/lander` → `@mdwrk/lander`

Applications may depend on packages. Packages may **not** depend on applications.

### Contracts
Normative interfaces and schemas.

- `@mdwrk/extension-manifest`
- `@mdwrk/extension-host`
- `@mdwrk/theme-contract`

These packages are intended to remain implementation-light and stable.

### Shared
Cross-cutting primitives that remain app-agnostic.

- `@mdwrk/ui-tokens`
- `@mdwrk/icons`
- `@mdwrk/i18n`
- `@mdwrk/testing`

### Renderer
Portable markdown rendering packages.

- `@mdwrk/markdown-renderer-core`
- `@mdwrk/markdown-renderer-react`

### Editor
Portable markdown editing packages.

- `@mdwrk/markdown-editor-core`
- `@mdwrk/markdown-editor-react`

### Extensions
Publishable extension packages and extension runtime.

- `@mdwrk/extension-runtime`
- `@mdwrk/extension-workspace-files`
- `@mdwrk/extension-git-ops`
- `@mdwrk/extension-manager`
- `@mdwrk/extension-gemini-agent`
- `@mdwrk/extension-theme-studio`
- `@mdwrk/extension-catalog-hello`

### Examples
Validation and demo packages.

- `@mdwrk/example-editor-basic`
- `@mdwrk/example-renderer-basic`

## Naming rules

### npm scope
All workspace packages use the npm scope:

- `@mdwrk/*`

### Path naming
Use lowercase kebab-case for package directories.

Examples:
- `packages/extensions/extension-runtime`
- `packages/renderer/markdown-renderer-react`

### Extension ids
Extension ids are stable dot-separated identifiers independent of folder names.

Examples:
- `core.workspace-files`
- `core.git-ops`
- `core.extension-manager`
- `core.gemini-agent`
- `core.theme-studio`

## Ownership rules

- `apps/*` own product composition, routing, deployment, and end-user assembly
- `packages/contracts/*` own normative interfaces and schemas
- `packages/shared/*` own reusable primitives
- `packages/renderer/*` own markdown rendering
- `packages/editor/*` own markdown editing
- `packages/extensions/*` own the extension runtime or extension packages
- `examples/*` own validation/demo surfaces only

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

## Current-state note

The release-ownership and promotion details for these package families are frozen separately in `docs/operations/release-groups.md`.
