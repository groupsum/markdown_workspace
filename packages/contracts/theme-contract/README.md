# @markdown-workspace/theme-contract

Portable token, class-name, and bridge-variable contract for Markdown Workspace themes, renderers, editors, and extensions.

## Package purpose

This package defines the shared styling surface that reusable packages and extensions must target.

## What it exports

- theme contract version
- canonical token names and definitions
- canonical class names and definitions
- canonical renderer/editor bridge-variable definitions
- compatibility metadata
- theme preset and draft shapes

## Derivation source

The initial contract is derived from:
- `apps/client/styles/base/root.css`
- `apps/client/styles/base/markdown.css`
- the extracted editor package surface

## Key contract surfaces

### Tokens
Examples:
- `bg-panel`
- `fg-primary`
- `accent`
- `font-mono`
- `editor-padding`

### Stable renderer classes
Examples:
- `markdown-body`
- `md-table`
- `md-code-block`

### Stable editor classes
Examples:
- `mw-editor`
- `mw-editor-gutter`
- `mw-editor-textarea`

### Bridge variables
Examples:
- renderer: `--mw-bg-surface`, `--mw-fg-primary`, `--mw-code-bg`
- editor: `--mwe-bg-surface`, `--mwe-fg-primary`, `--mwe-editor-padding`

## Build

```bash
npm run build -w @markdown-workspace/theme-contract
```

## Publishability

This package is structured as a standalone publishable npm package with typed exports and generated build output under `dist/`.
