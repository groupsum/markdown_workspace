<div align="center">
# @mdwrk/mdwrkcom-content-pack
**MdWrk public-site content distribution**
[![Hits](https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.packages_contentwrkcom_content_pack_README&left_text=hits)](https://github.com/groupsum/markdown_workspace/blob/master/packages/content/mdwrkcom-content-pack/README.md)
[![Downloads](https://img.shields.io/npm/dm/%40mdwrk%2Fmdwrkcom-content-pack?label=downloads)](https://www.npmjs.com/package/@mdwrk/mdwrkcom-content-pack)
[![Node](https://img.shields.io/badge/node-20.x%20%7C%2021.x%20%7C%2022.x-339933?logo=node.js&logoColor=white)](../../../package.json)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](../../../LICENSE)
</div>

This package distributes the mdwrk.com source content tree, markdown data, public assets, and generated discovery artifacts.

## Why
Use it when you need the content itself as a package boundary rather than consuming the mdwrk.com app repository structure directly.

## What
- Source content and markdown data roots.
- Sitemap definition path and generated discovery outputs.
- Path helpers for consumers that need stable package-relative access.

## Installation
Node.js 20.x through 22.x, matching the workspace engine contract in the root package manifest.

```bash
npm install @mdwrk/mdwrkcom-content-pack
```

## Usage
```ts
import { mdwrkcomContentPack, resolveMdwrkcomContentPackPath } from "@mdwrk/mdwrkcom-content-pack";

console.log(mdwrkcomContentPack.generatedArtifacts);
console.log(resolveMdwrkcomContentPackPath(mdwrkcomContentPack.sitemapPath));
```

## Related
- [Packages index](../../README.md) - family and package navigation
- [Root README](../../../README.md) - repo overview
