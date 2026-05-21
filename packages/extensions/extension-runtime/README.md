<div align="center">
# @mdwrk/extension-runtime
**Runtime for MdWrk extensions**
[![Hits](https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.packages_extensions_extension_runtime_README&left_text=hits)](https://github.com/groupsum/markdown_workspace/blob/master/packages/extensions/extension-runtime/README.md)
[![Downloads](https://img.shields.io/npm/dm/%40mdwrk%2Fextension-runtime?label=downloads)](https://www.npmjs.com/package/@mdwrk/extension-runtime)
[![Node](https://img.shields.io/badge/node-20.x%20%7C%2021.x%20%7C%2022.x-339933?logo=node.js&logoColor=white)](../../../package.json)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](../../../LICENSE)
</div>

This package loads, validates, activates, deactivates, catalogs, installs, and tracks MdWrk extensions against the host and contract baselines.

## Maintenance Status
This is a legacy bridge package in `groupsum/markdown_workspace`.

- Active maintenance moved to `groupsum/mdwrk`.
- Install compatibility remains on the same npm package name: `@mdwrk/extension-runtime`.
- Repository source of truth: [https://github.com/groupsum/mdwrk/tree/master/packages/extensions/extension-runtime](https://github.com/groupsum/mdwrk/tree/master/packages/extensions/extension-runtime)
- Bridge releases from this repo emit an install-time deprecation warning so downstream users can migrate without an immediate package rename.

## Why
Use it when you are building an extension host or testing extension lifecycle behavior.

## What
- Bundled and installed extension registration.
- Compatibility checks against host, runtime, editor, renderer, and theme baselines.
- Catalog loading, activation state, diagnostics, storage, and capability trimming.

## Installation
Node.js 20.x through 22.x, matching the workspace engine contract in the root package manifest.

```bash
npm install @mdwrk/extension-runtime @mdwrk/extension-host @mdwrk/extension-manifest
```

## Usage
Use this package inside a host implementation. Pair it with `@mdwrk/extension-host` and `@mdwrk/extension-manifest` for a complete extension boundary.

## Related
- [Packages index](../../README.md) - family and package navigation
- [Root README](../../../README.md) - repo overview
