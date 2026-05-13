# @mdwrk/extension-workspace-files

**Workspace file-system extension**

<p align="center">
  <a href="https://github.com/groupsum/markdown_workspace/blob/master/packages/extensions/extension-workspace-files/README.md"><img alt="Hits" src="https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.packages_extensions_extension_workspace_files_README&amp;left_text=hits" /></a>
  <a href="https://www.npmjs.com/package/@mdwrk/extension-workspace-files"><img alt="Downloads" src="https://img.shields.io/npm/dm/%40mdwrk%2Fextension-workspace-files?label=downloads" /></a>
  <a href="../../../package.json"><img alt="Node" src="https://img.shields.io/badge/node-20.x%20%7C%2021.x%20%7C%2022.x-339933?logo=node.js&amp;logoColor=white" /></a>
  <a href="../../../LICENSE"><img alt="License: Apache-2.0" src="https://img.shields.io/badge/license-Apache--2.0-blue.svg" /></a>
</p>

This package provides the first-party extension that backs project and file browsing inside the MdWrk workspace shell.

## Why
Use it when the host needs the default workspace file experience rather than only custom extension views.

## What
- Bundled workspace browsing and file operations.
- A first-party extension package consumed by the client host.
- A reference extension for workspace-centric host APIs.

## Installation
Node.js 20.x through 22.x, matching the workspace engine contract in the root package manifest.

```bash
npm install @mdwrk/extension-workspace-files @mdwrk/extension-runtime
```

## Usage
Load it as a bundled extension inside a host that implements the MdWrk workspace APIs.

## Related
- [Packages index](../../README.md) - family and package navigation
- [Root README](../../../README.md) - repo overview
