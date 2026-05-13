# @mdwrk/extension-runtime

**Runtime for MdWrk extensions**

<p align="center">
  <a href="https://github.com/groupsum/markdown_workspace/blob/master/packages/extensions/extension-runtime/README.md"><img alt="Hits" src="https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.packages_extensions_extension_runtime_README&amp;left_text=hits" /></a>
  <a href="https://www.npmjs.com/package/@mdwrk/extension-runtime"><img alt="Downloads" src="https://img.shields.io/npm/dm/%40mdwrk%2Fextension-runtime?label=downloads" /></a>
  <a href="../../../package.json"><img alt="Node" src="https://img.shields.io/badge/node-20.x%20%7C%2021.x%20%7C%2022.x-339933?logo=node.js&amp;logoColor=white" /></a>
  <a href="../../../LICENSE"><img alt="License: Apache-2.0" src="https://img.shields.io/badge/license-Apache--2.0-blue.svg" /></a>
</p>

This package loads, validates, activates, deactivates, catalogs, installs, and tracks MdWrk extensions against the host and contract baselines.

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
