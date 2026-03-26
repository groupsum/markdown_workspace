# Token and class naming guide

## Purpose

This guide documents the naming rules for the shared styling surface used by Markdown Workspace packages and applications.

## Token naming rules

### Rule 1 — all theme tokens are kebab-case
Examples:
- `bg-app`
- `fg-primary`
- `table-header-bg`
- `font-mono`

### Rule 2 — the runtime CSS custom property form is `--<token-name>`
Examples:
- token `bg-app` → CSS variable `--bg-app`
- token `font-ui` → CSS variable `--font-ui`

### Rule 3 — tokens describe semantics, not implementation details
Preferred:
- `bg-panel`
- `fg-muted`
- `status-error`

Avoid introducing tokens that encode one specific component implementation unless the token is part of the stable cross-package contract.

## Class naming rules

### Stable theme-contract classes
The stable cross-package class contract is defined in `mdwrk/theme-contract` and re-exported by `mdwrk/ui-tokens`.

Examples:
- `.markdown-body`
- `.md-task-list-item`
- `.md-checkbox`
- `.md-table`
- `.md-table-header`
- `.md-table-cell`
- `.md-code-block`
- `.md-code-header`
- `.md-code-surface`

### Renderer helper classes
The current client also uses helper classes that are implementation-facing rather than part of the narrow theme contract.

Examples:
- `.md-h1` through `.md-h6`
- `.md-p`
- `.md-link`
- `.md-inline-code`
- `.md-ul`, `.md-ol`, `.md-li`
- `.md-table-columns`, `.md-table-column`

These helper classes are exported by `mdwrk/ui-tokens` so renderer packages and applications can share them without depending on `apps/client`.

## Stability guidance

- **stable**: documented in `mdwrk/theme-contract`; safe for package-to-package interoperability
- **provisional**: extracted from the current client and reusable now, but not yet frozen as part of the formal theme contract

## Package sources of truth

- normative contract: `mdwrk/theme-contract`
- implemented CSS and helper classes: `mdwrk/ui-tokens`
