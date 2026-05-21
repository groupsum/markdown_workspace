<div align="center">
# @mdwrk/ui-tokens
**Shared token defaults and class helpers**
[![Hits](https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.packages_shared_ui_tokens_README&left_text=hits)](https://github.com/groupsum/markdown_workspace/blob/master/packages/shared/ui-tokens/README.md)
[![Downloads](https://img.shields.io/npm/dm/%40mdwrk%2Fui-tokens?label=downloads)](https://www.npmjs.com/package/@mdwrk/ui-tokens)
[![Node](https://img.shields.io/badge/node-20.x%20%7C%2021.x%20%7C%2022.x-339933?logo=node.js&logoColor=white)](../../../package.json)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](../../../LICENSE)
</div>

This package exposes the shared MdWrk token defaults, names, and CSS custom-property helpers used across the workspace.

## Maintenance Status
This is a legacy bridge package in `groupsum/markdown_workspace`.

- Active maintenance moved to `groupsum/mdwrk`.
- Install compatibility remains on the same npm package name: `@mdwrk/ui-tokens`.
- Repository source of truth: [https://github.com/groupsum/mdwrk/tree/master/packages/shared/ui-tokens](https://github.com/groupsum/mdwrk/tree/master/packages/shared/ui-tokens)
- Bridge releases from this repo emit an install-time deprecation warning so downstream users can migrate without an immediate package rename.

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
