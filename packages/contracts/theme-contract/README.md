# @mdwrk/theme-contract

**Portable MdWrk theme compatibility surface**

<p align="center">
  <a href="https://github.com/groupsum/markdown_workspace/blob/master/packages/contracts/theme-contract/README.md"><img alt="Hits" src="https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.packages_contracts_theme_contract_README&amp;left_text=hits" /></a>
  <a href="https://www.npmjs.com/package/@mdwrk/theme-contract"><img alt="Downloads" src="https://img.shields.io/npm/dm/%40mdwrk%2Ftheme-contract?label=downloads" /></a>
  <a href="../../../package.json"><img alt="Node" src="https://img.shields.io/badge/node-20.x%20%7C%2021.x%20%7C%2022.x-339933?logo=node.js&amp;logoColor=white" /></a>
  <a href="../../../LICENSE"><img alt="License: Apache-2.0" src="https://img.shields.io/badge/license-Apache--2.0-blue.svg" /></a>
</p>

This package defines the stable MdWrk theme token, class-name, bridge, and preset compatibility surface used across apps, renderers, editors, and extensions.

## Why
Use it when you need themes to remain compatible across multiple MdWrk surfaces instead of drifting app by app.

## What
- Theme preset and draft shapes.
- Stable token and class-name contracts.
- Bridge metadata used to map token values into target surfaces.
- Shared mobile rail, toolbar/footer, editor-width, and lander-compatible token names.

## Installation
Node.js 20.x through 22.x, matching the workspace engine contract in the root package manifest.

```bash
npm install @mdwrk/theme-contract
```

## Usage
```ts
import { createEmptyThemePreset } from "@mdwrk/theme-contract";

const preset = createEmptyThemePreset("my-theme", "My Theme");

preset.tokens = {
  "color.canvas": "#111111",
};
```

## Related
- [Packages index](../../README.md) - family and package navigation
- [Root README](../../../README.md) - repo overview
