# @mdwrk/extension-manifest

**Extension metadata and compatibility contract**

<p align="center">
  <a href="https://github.com/groupsum/markdown_workspace/blob/master/packages/contracts/extension-manifest/README.md"><img alt="Hits" src="https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.packages_contracts_extension_manifest_README&amp;left_text=hits" /></a>
  <a href="https://www.npmjs.com/package/@mdwrk/extension-manifest"><img alt="Downloads" src="https://img.shields.io/npm/dm/%40mdwrk%2Fextension-manifest?label=downloads" /></a>
  <a href="../../../package.json"><img alt="Node" src="https://img.shields.io/badge/node-20.x%20%7C%2021.x%20%7C%2022.x-339933?logo=node.js&amp;logoColor=white" /></a>
  <a href="../../../LICENSE"><img alt="License: Apache-2.0" src="https://img.shields.io/badge/license-Apache--2.0-blue.svg" /></a>
</p>

This package defines the canonical MdWrk extension manifest shape, including capabilities, contributions, settings, integrity data, and compatibility declarations.

## Why
Use it when you need to describe an extension package in a durable, host-agnostic way.

## What
- Manifest structure for bundled and external extensions.
- Capability, contribution, settings, i18n, support, integrity, and distribution types.
- The package boundary consumed by extension packages, runtimes, and host validators.

## Installation
Node.js 20.x through 22.x, matching the workspace engine contract in the root package manifest.

```bash
npm install @mdwrk/extension-manifest
```

## Usage
```ts
import type { ExtensionManifest } from "@mdwrk/extension-manifest";

const manifest: ExtensionManifest = {
  manifestVersion: 1,
  id: "example.extension",
  packageName: "@scope/example-extension",
  version: "1.0.0",
  displayName: { defaultMessage: "Example Extension" },
  description: { defaultMessage: "Demonstrates the manifest contract." },
  kind: "bundled",
  icon: { kind: "lucide", name: "Plug" },
  enabledByDefault: true,
  capabilities: [],
  compatibility: { hostApi: "*", runtime: "*", themeContract: "*" },
  entry: { module: "./index.js" },
  contributions: {},
};
```

## Related
- [Packages index](../../README.md) - family and package navigation
- [Root README](../../../README.md) - repo overview
