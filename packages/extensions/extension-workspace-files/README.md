<div align="center">
# @mdwrk/extension-workspace-files
**Workspace file-system extension**
[![Hits](https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.packages_extensions_extension_workspace_files_README&left_text=hits)](https://github.com/groupsum/markdown_workspace/blob/master/packages/extensions/extension-workspace-files/README.md)
[![Downloads](https://img.shields.io/npm/dm/%40mdwrk%2Fextension-workspace-files?label=downloads)](https://www.npmjs.com/package/@mdwrk/extension-workspace-files)
[![Node](https://img.shields.io/badge/node-20.x%20%7C%2021.x%20%7C%2022.x-339933?logo=node.js&logoColor=white)](../../../package.json)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](../../../LICENSE)
</div>

This package provides the first-party extension that backs project and file browsing inside the MdWrk workspace shell.

## Maintenance Status
This is a legacy bridge package in `groupsum/markdown_workspace`.

- Active maintenance moved to `groupsum/mdwrk`.
- Install compatibility remains on the same npm package name: `@mdwrk/extension-workspace-files`.
- Repository source of truth: [https://github.com/groupsum/mdwrk/tree/master/packages/extensions/extension-workspace-files](https://github.com/groupsum/mdwrk/tree/master/packages/extensions/extension-workspace-files)
- Bridge releases from this repo emit an install-time deprecation warning so downstream users can migrate without an immediate package rename.

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
