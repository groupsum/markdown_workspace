# @markdown-workspace/ui-tokens

Shared CSS tokens, root variables, markdown/editor class names, and theme mapping helpers for Markdown Workspace applications and packages.

## What this package contains

- the reusable root CSS variable contract
- the reusable markdown rendering stylesheet
- token and class-name re-exports aligned to `@markdown-workspace/theme-contract`
- theme CSS generation helpers for first-party and third-party consumers
- renderer/editor bridge variable helpers

## CSS entry points

- `@markdown-workspace/ui-tokens/styles/index.css`
- `@markdown-workspace/ui-tokens/styles/root.css`
- `@markdown-workspace/ui-tokens/styles/markdown.css`

## TypeScript entry points

- `@markdown-workspace/ui-tokens`
- `@markdown-workspace/ui-tokens/tokens`
- `@markdown-workspace/ui-tokens/classes`
- `@markdown-workspace/ui-tokens/theme-map`

## Example

```ts
import "@markdown-workspace/ui-tokens/styles/index.css";
import {
  renderThemeCssVariables,
  renderThemeBridgeCssVariables,
} from "@markdown-workspace/ui-tokens/theme-map";

const hostCss = renderThemeCssVariables(
  {
    "bg-app": "#111111",
    accent: "#7c3aed",
  },
  { selector: ".my-theme" },
);

const rendererCss = renderThemeBridgeCssVariables(
  "renderer",
  {
    "bg-panel": "#111111",
    "fg-primary": "#fafafa",
    accent: "#7c3aed",
  },
  { selector: ".my-theme .markdown-renderer" },
);
```

## Contract alignment

The exported token names, theme classes, and bridge definitions align with `@markdown-workspace/theme-contract`. That keeps the implemented styling primitives aligned with the normative contract package.
