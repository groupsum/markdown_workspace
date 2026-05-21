<div align="center">
# @mdwrk/icons
**Workspace icon catalog**
[![Hits](https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.packages_shared_icons_README&left_text=hits)](https://github.com/groupsum/markdown_workspace/blob/master/packages/shared/icons/README.md)
[![Downloads](https://img.shields.io/npm/dm/%40mdwrk%2Ficons?label=downloads)](https://www.npmjs.com/package/@mdwrk/icons)
[![Node](https://img.shields.io/badge/node-20.x%20%7C%2021.x%20%7C%2022.x-339933?logo=node.js&logoColor=white)](../../../package.json)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](../../../LICENSE)
</div>

This package provides stable icon identifiers and metadata for MdWrk applications and packages.

## Maintenance Status
This is a legacy bridge package in `groupsum/markdown_workspace`.

- Active maintenance moved to `groupsum/mdwrk`.
- Install compatibility remains on the same npm package name: `@mdwrk/icons`.
- Repository source of truth: [https://github.com/groupsum/mdwrk/tree/master/packages/shared/icons](https://github.com/groupsum/mdwrk/tree/master/packages/shared/icons)
- Bridge releases from this repo emit an install-time deprecation warning so downstream users can migrate without an immediate package rename.

## Why
Use it when you want icon references to stay semantic and package-safe instead of scattering raw icon names through the codebase.

## What
- A curated workspace icon id list.
- Icon metadata that maps semantic ids to Lucide names and categories.
- Shared icon definitions for apps, extensions, and docs-friendly catalogs.

## Installation
Node.js 20.x through 22.x, matching the workspace engine contract in the root package manifest.

```bash
npm install @mdwrk/icons
```

## Usage
```ts
import { WORKSPACE_ICON_CATALOG, getWorkspaceIconDefinition } from "@mdwrk/icons";

const icon = getWorkspaceIconDefinition("workspace.file");
console.log(icon?.lucideName, WORKSPACE_ICON_CATALOG.length);
```

## Related
- [Packages index](../../README.md) - family and package navigation
- [Root README](../../../README.md) - repo overview
