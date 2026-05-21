<div align="center">
# @mdwrk/extension-manager
**First-party extension operations console**
[![Hits](https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.packages_extensions_extension_manager_README&left_text=hits)](https://github.com/groupsum/markdown_workspace/blob/master/packages/extensions/extension-manager/README.md)
[![Downloads](https://img.shields.io/npm/dm/%40mdwrk%2Fextension-manager?label=downloads)](https://www.npmjs.com/package/@mdwrk/extension-manager)
[![Node](https://img.shields.io/badge/node-20.x%20%7C%2021.x%20%7C%2022.x-339933?logo=node.js&logoColor=white)](../../../package.json)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](../../../LICENSE)
</div>

This package provides the first-party bundled operator console for browsing, enabling, disabling, configuring, and diagnosing MdWrk extensions.

## Maintenance Status
This is a legacy bridge package in `groupsum/markdown_workspace`.

- Active maintenance moved to `groupsum/mdwrk`.
- Install compatibility remains on the same npm package name: `@mdwrk/extension-manager`.
- Repository source of truth: [https://github.com/groupsum/mdwrk/tree/master/packages/extensions/extension-manager](https://github.com/groupsum/mdwrk/tree/master/packages/extensions/extension-manager)
- Bridge releases from this repo emit an install-time deprecation warning so downstream users can migrate without an immediate package rename.

## Why
Use it when you want a concrete management surface on top of the runtime rather than only the headless runtime APIs.

## What
- A packaged first-party extension, not the core runtime itself.
- Views and UI for extension inventory, state, and diagnostics.
- A bundled entry surface consumed by the client host.

## Installation
Node.js 20.x through 22.x, matching the workspace engine contract in the root package manifest.

```bash
npm install @mdwrk/extension-manager @mdwrk/extension-runtime
```

## Usage
Import this package into a host that already exposes the MdWrk extension runtime and host APIs.

## Related
- [Packages index](../../README.md) - family and package navigation
- [Root README](../../../README.md) - repo overview
