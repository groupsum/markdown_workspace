# @mdwrk/icons

**Workspace icon catalog**

<p align="center">
  <a href="https://github.com/groupsum/markdown_workspace/blob/master/packages/shared/icons/README.md"><img alt="Hits" src="https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.packages_shared_icons_README&amp;left_text=hits" /></a>
  <a href="https://www.npmjs.com/package/@mdwrk/icons"><img alt="Downloads" src="https://img.shields.io/npm/dm/%40mdwrk%2Ficons?label=downloads" /></a>
  <a href="../../../package.json"><img alt="Node" src="https://img.shields.io/badge/node-20.x%20%7C%2021.x%20%7C%2022.x-339933?logo=node.js&amp;logoColor=white" /></a>
  <a href="../../../LICENSE"><img alt="License: Apache-2.0" src="https://img.shields.io/badge/license-Apache--2.0-blue.svg" /></a>
</p>

This package provides stable icon identifiers and metadata for MdWrk applications and packages.

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
