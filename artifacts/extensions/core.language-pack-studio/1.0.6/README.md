<div align="center">
# @mdwrk/extension-language-pack-studio
**Language-pack authoring extension**
[![Hits](https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.packages_extensions_extension_language_pack_studio_README&left_text=hits)](https://github.com/groupsum/markdown_workspace/blob/master/packages/extensions/extension-language-pack-studio/README.md)
[![Downloads](https://img.shields.io/npm/dm/%40mdwrk%2Fextension-language-pack-studio?label=downloads)](https://www.npmjs.com/package/@mdwrk/extension-language-pack-studio)
[![Node](https://img.shields.io/badge/node-20.x%20%7C%2021.x%20%7C%2022.x-339933?logo=node.js&logoColor=white)](../../../package.json)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](../../../LICENSE)
</div>

This package provides the first-party extension for inspecting and shaping language-pack data inside MdWrk hosts.

## Maintenance Status
This is a legacy bridge package in `groupsum/markdown_workspace`.

- Active maintenance moved to `groupsum/mdwrk`.
- Install compatibility remains on the same npm package name: `@mdwrk/extension-language-pack-studio`.
- Repository source of truth: [https://github.com/groupsum/mdwrk/tree/master/packages/extensions/extension-language-pack-studio](https://github.com/groupsum/mdwrk/tree/master/packages/extensions/extension-language-pack-studio)
- Bridge releases from this repo emit an install-time deprecation warning so downstream users can migrate without an immediate package rename.

## Why
Use it when localization authoring should remain an extension concern instead of being hard-wired into the app shell.

## What
- Bundled extension entrypoints and language-pack helpers.
- A first-party consumer of the i18n package family and host APIs.
- A workspace authoring surface for localization-related workflows.

## Installation
Node.js 20.x through 22.x, matching the workspace engine contract in the root package manifest.

```bash
npm install @mdwrk/extension-language-pack-studio @mdwrk/i18n
```

## Usage
Load it as a bundled extension in a host with i18n and workspace capabilities.

## Related
- [Packages index](../../README.md) - family and package navigation
- [Root README](../../../README.md) - repo overview
