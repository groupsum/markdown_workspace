# @mdwrk/lander-core

**Content compiler and diagnostics**

<p align="center">
  <a href="https://github.com/groupsum/markdown_workspace/blob/master/packages/lander/lander-core/README.md"><img alt="Hits" src="https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.packages_lander_lander_core_README&amp;left_text=hits" /></a>
  <a href="https://www.npmjs.com/package/@mdwrk/lander-core"><img alt="Downloads" src="https://img.shields.io/npm/dm/%40mdwrk%2Flander-core?label=downloads" /></a>
  <a href="../../../package.json"><img alt="Node" src="https://img.shields.io/badge/node-20.x%20%7C%2021.x%20%7C%2022.x-339933?logo=node.js&amp;logoColor=white" /></a>
  <a href="../../../LICENSE"><img alt="License: Apache-2.0" src="https://img.shields.io/badge/license-Apache--2.0-blue.svg" /></a>
</p>

This package compiles lander content, validates it, derives breadcrumbs and internal links, and generates sitemap, robots, and llms.txt outputs.

## Why
Use it when you need the compile-time logic behind a product lander without committing to a UI layer yet.

## What
- Site definition helpers and validation.
- Compiled page metadata such as breadcrumbs, internal links, and word counts.
- Sitemap, robots.txt, and llms.txt generation.

## Installation
Node.js 20.x through 22.x, matching the workspace engine contract in the root package manifest.

```bash
npm install @mdwrk/lander-core @mdwrk/lander-content-contract
```

## Usage
```ts
import { compileLanderSite, defineLanderSite } from "@mdwrk/lander-core";

const site = defineLanderSite({
  product: {
    name: "MdWrk",
    slug: "mdwrk",
    tagline: "Markdown workspace platform",
    description: "Portable markdown authoring and publishing.",
    category: "DeveloperTool",
    canonicalUrl: "https://mdwrk.com",
  },
  pages: [],
});

const compiled = compileLanderSite(site);
```

## Related
- [Packages index](../../README.md) - family and package navigation
- [Root README](../../../README.md) - repo overview
