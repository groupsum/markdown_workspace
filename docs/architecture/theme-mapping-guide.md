# Theme mapping guide

## Purpose

This guide explains how first-party applications and third-party consumers should map their own theme implementations onto the shared Markdown Workspace styling surface.

## Recommended model

Applications should treat `@mdwrk/ui-tokens` as the reusable styling surface and map local theme values onto the shared token names.
Renderer and editor packages then inherit those values through the standardized bridge variables.

## First-party mapping

The Markdown Workspace client already uses CSS custom properties such as:
- `--bg-app`
- `--bg-panel`
- `--bg-inset`
- `--fg-primary`
- `--fg-secondary`
- `--fg-muted`
- `--accent`
- `--font-ui`
- `--font-mono`
- `--editor-padding`

Because those names are exported through `@mdwrk/theme-contract` and `@mdwrk/ui-tokens`, first-party apps can continue overriding the same variables in theme-specific stylesheets.

## Renderer and editor bridge mapping

Portable packages inherit host theme values through bridge variables.

### Renderer bridge

Use `createRendererThemeBridgeVariableRecord()` or `renderThemeBridgeCssVariables('renderer', ...)` to materialize values such as:
- `--mw-bg-surface`
- `--mw-fg-primary`
- `--mw-code-bg`
- `--mw-font-mono`

### Editor bridge

Use `createEditorThemeBridgeVariableRecord()` or `renderThemeBridgeCssVariables('editor', ...)` to materialize values such as:
- `--mwe-bg-surface`
- `--mwe-bg-gutter`
- `--mwe-fg-primary`
- `--mwe-editor-padding`

## First-party host example

```ts
import { renderThemeBridgeCssVariables } from '@mdwrk/ui-tokens/theme-map';

const rendererCss = renderThemeBridgeCssVariables('renderer', {
  'bg-panel': '#101418',
  'bg-inset': '#16202b',
  'fg-primary': '#f8fafc',
  'fg-secondary': '#d5dde6',
  accent: '#5eead4',
}, { selector: '.preview-surface' });
```

## Third-party mapping

A third-party implementer should:

1. import `@mdwrk/ui-tokens/styles/index.css`
2. apply overrides for the shared host variables on a wrapper selector
3. optionally emit bridge variables for renderer/editor scopes programmatically

Host-token example:

```css
.third-party-theme {
  --bg-app: #101418;
  --bg-panel: #17202b;
  --bg-inset: #1f2937;
  --fg-primary: #f5f7fa;
  --fg-secondary: #d9e2ec;
  --fg-muted: #9fb3c8;
  --accent: #5eead4;
  --border-color: #334155;
  --font-ui: Inter, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", monospace;
}
```

Programmatic example:

```ts
import {
  renderThemeCssVariables,
  renderThemeBridgeCssVariables,
} from '@mdwrk/ui-tokens/theme-map';

const hostCss = renderThemeCssVariables(
  {
    'bg-app': '#101418',
    'bg-panel': '#17202b',
    accent: '#5eead4',
  },
  { selector: '.third-party-theme' },
);

const rendererCss = renderThemeBridgeCssVariables(
  'renderer',
  {
    'bg-panel': '#17202b',
    'fg-primary': '#f5f7fa',
    accent: '#5eead4',
  },
  { selector: '.third-party-theme .markdown-renderer' },
);
```

## Renderer/editor package helpers

The React package families also expose bridge helpers:

- `createMarkdownRendererThemeVariablesFromThemeTokens()`
- `createMarkdownRendererThemeStyleFromThemeTokens()`
- `createMarkdownEditorThemeVariablesFromThemeTokens()`
- `createMarkdownEditorThemeStyleFromThemeTokens()`

These let consumers build React `style` objects directly from canonical theme token overrides.

## Important rules

- reusable packages must not import application-local stylesheets
- applications own theme application and theme selection
- shared packages own the reusable token/class surface
- the theme-contract package remains the normative schema for stable tokens, stable classes, and bridge variables
- package consumers may map theme values through host tokens or direct bridge-variable generation, but they should not depend on private DOM structure
