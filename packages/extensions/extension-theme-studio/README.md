# @mdwrk/extension-theme-studio

**Theme authoring extension**

<p align="center">
  <a href="https://github.com/groupsum/markdown_workspace/blob/master/packages/extensions/extension-theme-studio/README.md"><img alt="Hits" src="https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.packages_extensions_extension_theme_studio_README&amp;left_text=hits" /></a>
  <a href="https://www.npmjs.com/package/@mdwrk/extension-theme-studio"><img alt="Downloads" src="https://img.shields.io/npm/dm/%40mdwrk%2Fextension-theme-studio?label=downloads" /></a>
  <a href="../../../package.json"><img alt="Node" src="https://img.shields.io/badge/node-20.x%20%7C%2021.x%20%7C%2022.x-339933?logo=node.js&amp;logoColor=white" /></a>
  <a href="../../../LICENSE"><img alt="License: Apache-2.0" src="https://img.shields.io/badge/license-Apache--2.0-blue.svg" /></a>
</p>

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
