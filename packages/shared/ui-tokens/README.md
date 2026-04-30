# mdwrk/ui-tokens

Shared CSS tokens, root variables, markdown/editor class names, and theme mapping helpers for MdWork applications and packages.

## What this package contains

- the reusable root CSS variable contract
- the reusable markdown rendering stylesheet
- token and class-name re-exports aligned to `mdwrk/theme-contract`
- theme CSS generation helpers for first-party and third-party consumers
- renderer/editor bridge variable helpers
- the Phase 9 rhythm/layout token surfaces used by editor gutters, preview heading rhythm, and responsive shell width

## CSS entry points

- `mdwrk/ui-tokens/styles/index.css`
- `mdwrk/ui-tokens/styles/root.css`
- `mdwrk/ui-tokens/styles/markdown.css`

## TypeScript entry points

- `mdwrk/ui-tokens`
- `mdwrk/ui-tokens/tokens`
- `mdwrk/ui-tokens/classes`
- `mdwrk/ui-tokens/theme-map`

## Example

```ts
import "@mdwrk/ui-tokens/styles/index.css";
import {
  renderThemeCssVariables,
  renderThemeBridgeCssVariables,
} from "@mdwrk/ui-tokens/theme-map";

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

The exported token names, theme classes, and bridge definitions align with `mdwrk/theme-contract`. That keeps the implemented styling primitives aligned with the normative contract package.

Phase 9 expands that alignment to include editor/preview rhythm tokens and the mobile-width token surfaces consumed by the active client responsive shell.
