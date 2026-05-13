# @mdwrk/extension-catalog-hello

**External catalog sample extension**

<p align="center">
  <a href="https://github.com/groupsum/markdown_workspace/blob/master/packages/extensions/extension-catalog-hello/README.md"><img alt="Hits" src="https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.packages_extensions_extension_catalog_hello_README&amp;left_text=hits" /></a>
  <a href="https://www.npmjs.com/package/@mdwrk/extension-catalog-hello"><img alt="Downloads" src="https://img.shields.io/npm/dm/%40mdwrk%2Fextension-catalog-hello?label=downloads" /></a>
  <a href="../../../package.json"><img alt="Node" src="https://img.shields.io/badge/node-20.x%20%7C%2021.x%20%7C%2022.x-339933?logo=node.js&amp;logoColor=white" /></a>
  <a href="../../../LICENSE"><img alt="License: Apache-2.0" src="https://img.shields.io/badge/license-Apache--2.0-blue.svg" /></a>
</p>

This package is a sample external extension used to validate catalog discovery, installation, trust, and runtime activation.

## Why
Use it when you need a small, auditable example of the external-extension path rather than a large first-party extension.

## What
- A tiny extension that registers a view and action-rail item.
- An installable external-package example for trust and catalog flow.
- A simple reference implementation for downstream extension authors.

## Installation
Node.js 20.x through 22.x, matching the workspace engine contract in the root package manifest.

```bash
npm install @mdwrk/extension-catalog-hello
```

## Usage
```ts
import extensionCatalogHello from "@mdwrk/extension-catalog-hello";

console.log(extensionCatalogHello.manifest.id);
```

## Related
- [Packages index](../../README.md) - family and package navigation
- [Root README](../../../README.md) - repo overview
