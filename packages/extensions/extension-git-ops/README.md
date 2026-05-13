# @mdwrk/extension-git-ops

**Git workflow extension**

<p align="center">
  <a href="https://github.com/groupsum/markdown_workspace/blob/master/packages/extensions/extension-git-ops/README.md"><img alt="Hits" src="https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.packages_extensions_extension_git_ops_README&amp;left_text=hits" /></a>
  <a href="https://www.npmjs.com/package/@mdwrk/extension-git-ops"><img alt="Downloads" src="https://img.shields.io/npm/dm/%40mdwrk%2Fextension-git-ops?label=downloads" /></a>
  <a href="../../../package.json"><img alt="Node" src="https://img.shields.io/badge/node-20.x%20%7C%2021.x%20%7C%2022.x-339933?logo=node.js&amp;logoColor=white" /></a>
  <a href="../../../LICENSE"><img alt="License: Apache-2.0" src="https://img.shields.io/badge/license-Apache--2.0-blue.svg" /></a>
</p>

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
