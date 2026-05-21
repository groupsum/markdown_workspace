<div align="center">
# @mdwrk/lander-seo
**Metadata, scoring, and discovery helpers**
[![Hits](https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.packages_lander_lander_seo_README&left_text=hits)](https://github.com/groupsum/markdown_workspace/blob/master/packages/lander/lander-seo/README.md)
[![Downloads](https://img.shields.io/npm/dm/%40mdwrk%2Flander-seo?label=downloads)](https://www.npmjs.com/package/@mdwrk/lander-seo)
[![Node](https://img.shields.io/badge/node-20.x%20%7C%2021.x%20%7C%2022.x-339933?logo=node.js&logoColor=white)](../../../package.json)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](../../../LICENSE)
</div>

This package provides metadata assembly, page scoring, AI summary helpers, and re-exports for sitemap, robots, and llms.txt generation.

## Maintenance Status
This is a legacy bridge package in `groupsum/markdown_workspace`.

- Active maintenance moved to `groupsum/mdwrk-pages`.
- Install compatibility remains on the same npm package name: `@mdwrk/lander-seo`.
- Repository source of truth: [https://github.com/groupsum/mdwrk-pages/tree/master/packages/lander/lander-seo](https://github.com/groupsum/mdwrk-pages/tree/master/packages/lander/lander-seo)
- Bridge releases from this repo emit an install-time deprecation warning so downstream users can migrate without an immediate package rename.

## Why
Use it when you want lander SEO and AI-discovery helpers above the raw compiler output.

## What
- Page metadata builders.
- SEO scoring and diagnostics.
- AI summary helpers plus re-exports for crawl/discovery files.

## Installation
Node.js 20.x through 22.x, matching the workspace engine contract in the root package manifest.

```bash
npm install @mdwrk/lander-seo @mdwrk/lander-core
```

## Usage
```ts
import { buildAiSummary, buildPageMetadata, scoreSeoPage } from "@mdwrk/lander-seo";

console.log(buildAiSummary);
console.log(buildPageMetadata, scoreSeoPage);
```

## Related
- [Packages index](../../README.md) - family and package navigation
- [Root README](../../../README.md) - repo overview
