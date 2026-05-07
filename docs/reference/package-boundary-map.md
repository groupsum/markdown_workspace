# Package boundary map

This document records the intended boundary between reusable packages, extensions, applications, and examples.
It is part of the Phase 11 certification evidence set.

## Boundary layers

### Contracts

- `@mdwrk/extension-host`
- `@mdwrk/extension-manifest`
- `@mdwrk/theme-contract`

These packages define normative interfaces and are allowed to depend only on contract-level concerns.
They must not depend on app hosts.

### Shared packages

- `@mdwrk/i18n`
- `@mdwrk/icons`
- `@mdwrk/testing`
- `@mdwrk/ui-tokens`

These packages provide app-agnostic infrastructure and styling helpers.
They must not import `apps/client/*` or `apps/mdwrkcom/*` internals.

### Renderer / editor packages

- `@mdwrk/markdown-renderer-core`
- `@mdwrk/markdown-renderer-react`
- `@mdwrk/markdown-editor-core`
- `@mdwrk/markdown-editor-react`

These packages expose the public editing/rendering surfaces consumed by apps and examples.
They must not depend on app-owned state or shell internals.

### Lander packages

- `@mdwrk/lander-content-contract`
- `@mdwrk/lander-markdown-content-adapter`
- `@mdwrk/lander-core`
- `@mdwrk/lander-seo`
- `@mdwrk/lander-theme`
- `@mdwrk/lander-react`

These packages define the reusable lander content model, content-source adapters, compiler, SEO helpers, theme, and React rendering surfaces.
They must not depend on branded content packs.

### Content packages

- `@mdwrk/mdwrkcom-content-pack`

Content packages are branded or distributable content bundles.
They may mirror app-owned content, but reusable lander packages must not import them.

### Extension runtime and extension packages

- `@mdwrk/extension-runtime`
- first-party bundled extensions
- sample external extension package

These packages depend on contracts and host/runtime interfaces, not app-private modules.
They integrate with the host through the extension APIs.

### Apps

- `@mdwrk/mdwrkspace`
- `@mdwrk/mdwrkcom`

Apps are the integration layer.
They are allowed to depend on reusable packages, but reusable packages are not allowed to depend on app internals.

### Examples

- `@mdwrk/example-editor-basic`
- `@mdwrk/example-renderer-basic`

Examples validate public package surfaces and are intentionally separate from private workspace wiring.

## Phase 11 audit rule

Phase 11 package evidence includes a structural audit that rejects source-level imports from `packages/*` into `apps/client/*` or `apps/mdwrkcom/*`.
