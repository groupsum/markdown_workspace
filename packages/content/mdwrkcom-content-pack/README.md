# @mdwrk/mdwrkcom-content-pack

**MdWrk public-site content distribution**

<p align="center">
  <a href="https://github.com/groupsum/markdown_workspace/blob/master/packages/content/mdwrkcom-content-pack/README.md"><img alt="Hits" src="https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.packages_content_mdwrkcom_content_pack_README&amp;left_text=hits" /></a>
  <a href="https://www.npmjs.com/package/@mdwrk/mdwrkcom-content-pack"><img alt="Downloads" src="https://img.shields.io/npm/dm/%40mdwrk%2Fmdwrkcom-content-pack?label=downloads" /></a>
  <a href="../../../package.json"><img alt="Node" src="https://img.shields.io/badge/node-20.x%20%7C%2021.x%20%7C%2022.x-339933?logo=node.js&amp;logoColor=white" /></a>
  <a href="../../../LICENSE"><img alt="License: Apache-2.0" src="https://img.shields.io/badge/license-Apache--2.0-blue.svg" /></a>
</p>

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
