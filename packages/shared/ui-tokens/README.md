# @mdwrk/ui-tokens

**Shared token defaults and class helpers**

<p align="center">
  <a href="https://github.com/groupsum/markdown_workspace/blob/master/packages/shared/ui-tokens/README.md"><img alt="Hits" src="https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.packages_shared_ui_tokens_README&amp;left_text=hits" /></a>
  <a href="https://www.npmjs.com/package/@mdwrk/ui-tokens"><img alt="Downloads" src="https://img.shields.io/npm/dm/%40mdwrk%2Fui-tokens?label=downloads" /></a>
  <a href="../../../package.json"><img alt="Node" src="https://img.shields.io/badge/node-20.x%20%7C%2021.x%20%7C%2022.x-339933?logo=node.js&amp;logoColor=white" /></a>
  <a href="../../../LICENSE"><img alt="License: Apache-2.0" src="https://img.shields.io/badge/license-Apache--2.0-blue.svg" /></a>
</p>

This package exposes the shared MdWrk token defaults, names, and CSS custom-property helpers used across the workspace.

## Why
Use it when you need token values and names directly without importing the full theme authoring surface.

## What
- Stable token names and defaults.
- CSS custom-property lists for the shared UI contract.
- Theme-facing aliases built on top of the theme contract package.

## Installation
Node.js 20.x through 22.x, matching the workspace engine contract in the root package manifest.

```bash
npm install @mdwrk/ui-tokens
```

## Usage
```ts
import { MARKDOWN_WORKSPACE_TOKEN_DEFAULTS } from "@mdwrk/ui-tokens";

console.log(MARKDOWN_WORKSPACE_TOKEN_DEFAULTS["color.canvas"]);
```

## Related
- [Packages index](../../README.md) - family and package navigation
- [Root README](../../../README.md) - repo overview
