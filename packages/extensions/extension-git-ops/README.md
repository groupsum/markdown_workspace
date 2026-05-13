<div align="center">
# @mdwrk/extension-git-ops
**Git workflow extension**
[![Hits](https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.packages_extensions_extension_git_ops_README&left_text=hits)](https://github.com/groupsum/markdown_workspace/blob/master/packages/extensions/extension-git-ops/README.md)
[![Downloads](https://img.shields.io/npm/dm/%40mdwrk%2Fextension-git-ops?label=downloads)](https://www.npmjs.com/package/@mdwrk/extension-git-ops)
[![Node](https://img.shields.io/badge/node-20.x%20%7C%2021.x%20%7C%2022.x-339933?logo=node.js&logoColor=white)](../../../package.json)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](../../../LICENSE)
</div>

This package provides the first-party Git operations extension surface for MdWrk hosts.

## Why
Use it when you want Git-adjacent workflows exposed through the extension system instead of hard-coding them into the shell.

## What
- Bundled extension metadata and entrypoints for Git operations.
- A first-party package intended to register Git-oriented views and actions.
- A reusable extension boundary for hosts that support Git workflows.

## Installation
Node.js 20.x through 22.x, matching the workspace engine contract in the root package manifest.

```bash
npm install @mdwrk/extension-git-ops @mdwrk/extension-runtime
```

## Usage
Consume it as a bundled extension package inside a host that already provides runtime and workspace services.

## Related
- [Packages index](../../README.md) - family and package navigation
- [Root README](../../../README.md) - repo overview
