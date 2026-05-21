<div align="center">
# @mdwrk/extension-host
**Host API surface for MdWrk extensions**
[![Hits](https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.packages_contracts_extension_host_README&left_text=hits)](https://github.com/groupsum/markdown_workspace/blob/master/packages/contracts/extension-host/README.md)
[![Downloads](https://img.shields.io/npm/dm/%40mdwrk%2Fextension-host?label=downloads)](https://www.npmjs.com/package/@mdwrk/extension-host)
[![Node](https://img.shields.io/badge/node-20.x%20%7C%2021.x%20%7C%2022.x-339933?logo=node.js&logoColor=white)](../../../package.json)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](../../../LICENSE)
</div>

This package defines the host APIs that MdWrk extensions can use for commands, views, action rail items, settings, notifications, theme access, editor access, workspace access, i18n, diagnostics, and logging.

## Maintenance Status
This is a legacy bridge package in `groupsum/markdown_workspace`.

- Active maintenance moved to `groupsum/mdwrk`.
- Install compatibility remains on the same npm package name: `@mdwrk/extension-host`.
- Repository source of truth: [https://github.com/groupsum/mdwrk/tree/master/packages/contracts/extension-host](https://github.com/groupsum/mdwrk/tree/master/packages/contracts/extension-host)
- Bridge releases from this repo emit an install-time deprecation warning so downstream users can migrate without an immediate package rename.

## Why
Use it when you are implementing an extension or a host and need a stable boundary between the two.

## What
- Type contracts for extension lifecycle and registration.
- Host APIs for editor, workspace, theme, views, settings, notifications, diagnostics, and logging.
- Primitive interfaces shared by the runtime and bundled extensions.

## Installation
Node.js 20.x through 22.x, matching the workspace engine contract in the root package manifest.

```bash
npm install @mdwrk/extension-host
```

## Usage
```ts
import type { ExtensionHost } from "@mdwrk/extension-host";

export function boot(host: ExtensionHost) {
  return host.commands.list();
}
```

## Related
- [Packages index](../../README.md) - family and package navigation
- [Root README](../../../README.md) - repo overview
