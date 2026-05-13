<div align="center">
# @mdwrk/extension-theme-studio
**Theme authoring extension**
[![Hits](https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.packages_extensions_extension_theme_studio_README&left_text=hits)](https://github.com/groupsum/markdown_workspace/blob/master/packages/extensions/extension-theme-studio/README.md)
[![Downloads](https://img.shields.io/npm/dm/%40mdwrk%2Fextension-theme-studio?label=downloads)](https://www.npmjs.com/package/@mdwrk/extension-theme-studio)
[![Node](https://img.shields.io/badge/node-20.x%20%7C%2021.x%20%7C%2022.x-339933?logo=node.js&logoColor=white)](../../../package.json)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](../../../LICENSE)
</div>

This package provides the first-party theme authoring extension for token inspection, preview, apply/revert flow, and export helpers.

## Why
Use it when you want theme editing to live inside the extension system and remain aligned to the shared token contract.

## What
- Theme drafting and export helpers.
- Bundled views, services, and settings for theme authoring.
- A concrete consumer of the theme contract and shared token packages.

## Installation
Node.js 20.x through 22.x, matching the workspace engine contract in the root package manifest.

```bash
npm install @mdwrk/extension-theme-studio @mdwrk/theme-contract
```

## Usage
Load it into a host that implements the MdWrk theme APIs and wants a first-party authoring panel.

## Related
- [Packages index](../../README.md) - family and package navigation
- [Root README](../../../README.md) - repo overview
