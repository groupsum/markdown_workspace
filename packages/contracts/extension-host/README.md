# @mdwrk/extension-host

**Host API surface for MdWrk extensions**

<p align="center">
  <a href="https://github.com/groupsum/markdown_workspace/blob/master/packages/contracts/extension-host/README.md"><img alt="Hits" src="https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.packages_contracts_extension_host_README&amp;left_text=hits" /></a>
  <a href="https://www.npmjs.com/package/@mdwrk/extension-host"><img alt="Downloads" src="https://img.shields.io/npm/dm/%40mdwrk%2Fextension-host?label=downloads" /></a>
  <a href="../../../package.json"><img alt="Node" src="https://img.shields.io/badge/node-20.x%20%7C%2021.x%20%7C%2022.x-339933?logo=node.js&amp;logoColor=white" /></a>
  <a href="../../../LICENSE"><img alt="License: Apache-2.0" src="https://img.shields.io/badge/license-Apache--2.0-blue.svg" /></a>
</p>

This package defines the host APIs that MdWrk extensions can use for commands, views, action rail items, settings, notifications, theme access, editor access, workspace access, i18n, diagnostics, and logging.

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
