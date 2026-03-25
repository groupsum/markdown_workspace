# Theme token and class contract

## Source of truth

The normative TypeScript package is:

- `@mdwrk/theme-contract`

This package defines:
- token names
- token metadata
- class names
- class metadata
- renderer/editor bridge variables
- theme preset and draft shapes
- compatibility metadata

## Why the contract exists

The current client already has application theme variables and markdown-specific class names.
The contract package makes that styling surface portable so it can be reused by:

- the client app
- renderer packages
- editor packages
- first-party extensions
- third-party extensions
- third-party consumer applications

## Token model

The token contract publishes canonical names such as:
- `bg-app`
- `bg-panel`
- `bg-inset`
- `border-color`
- `fg-primary`
- `fg-secondary`
- `fg-muted`
- `accent`
- `font-ui`
- `font-mono`
- `editor-padding`

Each token definition includes:
- canonical token name
- CSS custom property binding
- category
- description
- default value
- stability level

## Class model

The class contract publishes portable semantic classes such as:

### Stable renderer classes
- `markdown-body`
- `md-task-list-item`
- `md-checkbox`
- `md-table`
- `md-table-head`
- `md-table-body`
- `md-table-row`
- `md-table-header`
- `md-table-cell`
- `md-table-caption`
- `md-code-block`
- `md-code-header`
- `md-code-surface`

### Stable editor classes
- `mw-editor`
- `mw-editor-layout`
- `mw-editor-gutter`
- `mw-editor-line-number`
- `mw-editor-textarea`

### Provisional helper classes
The contract also includes provisional helper classes such as `md-h1` through `md-h6`, `md-p`, `md-strong`, and list helpers. These are publishable but should be treated as less rigid than the stable semantic classes above.

## Theme bridge model

Renderer and editor packages do not style directly against host app-local selectors.
They consume bridge variables generated from the shared token contract.

### Renderer bridge variables
Examples:
- `--mw-fg-primary`
- `--mw-fg-secondary`
- `--mw-bg-surface`
- `--mw-border-color`
- `--mw-accent`
- `--mw-code-bg`
- `--mw-code-fg`
- `--mw-code-border`
- `--mw-font-ui`
- `--mw-font-mono`

### Editor bridge variables
Examples:
- `--mwe-bg-surface`
- `--mwe-bg-gutter`
- `--mwe-border-color`
- `--mwe-fg-primary`
- `--mwe-fg-muted`
- `--mwe-accent`
- `--mwe-font-mono`
- `--mwe-editor-padding`

These bridge definitions are exported from `@mdwrk/theme-contract/bridges` and materialized through `@mdwrk/ui-tokens/theme-map`.

## Derivation in the current repo

The initial token contract is derived from:
- `apps/client/styles/base/root.css`

The initial renderer class contract is derived from:
- `apps/client/styles/base/markdown.css`

The initial editor class contract is derived from:
- the extracted portable editor package and the client editing surface after Phase 5

## Consumer model

### First-party app consumer
The app maps its local theme implementation onto the shared contract and may export host CSS variables directly.

### Renderer/editor package consumer
Reusable packages target the shared contract directly and remain independent of app-local stylesheets.

### Third-party consumer
A third-party application can implement the same tokens/classes with its own styling system and either:
- emit host token variables
- emit renderer/editor bridge variables directly
- generate CSS blocks from `@mdwrk/ui-tokens/theme-map`

## Contract rules

- packages must not depend directly on `apps/client/styles/*`
- new public styling hooks must be added to the contract package before packages or extensions may rely on them
- semantic class names are preferred over DOM-structure selectors
- once a class or token is marked `stable`, it should only change under explicit contract version governance
- renderer/editor bridge variables are part of the public portable styling surface

## Compatibility

Themes should declare their contract version compatibility through the theme contract metadata.
Extensions that render or edit content should declare compatibility where relevant.
