# Package topology

Date: 2026-03-27

## Decision summary

The repository is a root npm workspace with explicit application, package, documentation, artifact, and example boundaries.
Applications compose packages; packages do not depend on applications.

This document now reflects the transition role of `markdown_workspace`. Many reusable packages remain present here as legacy bridge releases, but active package maintenance has moved to extracted repos.

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
- `apps/mdwrkcom` → `@mdwrk/mdwrkcom`

Applications may depend on packages. Packages may **not** depend on applications.

### Contracts
Normative interfaces and schemas.

- `@mdwrk/extension-manifest`
- `@mdwrk/extension-host`
- `@mdwrk/theme-contract`

These packages are intended to remain implementation-light and stable.
Active maintenance for this family now lives in `groupsum/mdwrk`; the copies in `markdown_workspace` are legacy bridge releases.

### Shared
Cross-cutting primitives that remain app-agnostic.

- `@mdwrk/ui-tokens`
- `@mdwrk/icons`
- `@mdwrk/i18n`
- `@mdwrk/testing`

`@mdwrk/structured-data` has moved with the lander stack to `groupsum/mdwrk-pages`. The remaining shared packages above are actively maintained in `groupsum/mdwrk`; the copies here are legacy bridge releases.

### Renderer
Portable markdown rendering packages.

- `@mdwrk/markdown-renderer-core`
- `@mdwrk/markdown-renderer-react`

Active maintenance for this family now lives in `groupsum/mdwrk`; the copies here are legacy bridge releases.

### Editor
Portable markdown editing packages.

- `@mdwrk/markdown-editor-core`
- `@mdwrk/markdown-editor-react`

Active maintenance for this family now lives in `groupsum/mdwrk`; the copies here are legacy bridge releases.

### Extensions
Publishable extension packages and extension runtime.

- `@mdwrk/extension-runtime`
- `@mdwrk/extension-workspace-files`
- `@mdwrk/extension-git-ops`
- `@mdwrk/extension-manager`
- `@mdwrk/extension-gemini-agent`
- `@mdwrk/extension-theme-studio`
- `@mdwrk/extension-catalog-hello`

Active maintenance for this family now lives in `groupsum/mdwrk`; the copies here are legacy bridge releases.

### Lander and content
Reusable lander, structured-data, and demo content packages.

- `@mdwrk/structured-data`
- `@mdwrk/lander-content-contract`
- `@mdwrk/lander-core`
- `@mdwrk/lander-seo`
- `@mdwrk/lander-theme`
- `@mdwrk/lander-react`
- `@mdwrk/lander-markdown-content-adapter`
- `@mdwrk/lander-page-templates`
- `@mdwrk/lander-page-template-presets`
- `@mdwrk/page-template-demo-content-pack`
- `@mdwrk/mdwrkcom-content-pack`

Active maintenance for the first ten packages in this section now lives in `groupsum/mdwrk-pages`; the copies here are legacy bridge releases. `@mdwrk/mdwrkcom-content-pack` remains maintained in `markdown_workspace`.

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
