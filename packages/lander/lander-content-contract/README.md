<div align="center">
# @mdwrk/lander-content-contract
**Portable site and page content types**
[![Hits](https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.packages_lander_lander_content_contract_README&left_text=hits)](https://github.com/groupsum/markdown_workspace/blob/master/packages/lander/lander-content-contract/README.md)
[![Downloads](https://img.shields.io/npm/dm/%40mdwrk%2Flander-content-contract?label=downloads)](https://www.npmjs.com/package/@mdwrk/lander-content-contract)
[![Node](https://img.shields.io/badge/node-20.x%20%7C%2021.x%20%7C%2022.x-339933?logo=node.js&logoColor=white)](../../../package.json)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](../../../LICENSE)
</div>

This package defines the site, page, section, schema, navigation, and FAQ types used by MdWrk lander surfaces.

## Maintenance Status
This is a legacy bridge package in `groupsum/markdown_workspace`.

- Active maintenance moved to `groupsum/mdwrk-pages`.
- Install compatibility remains on the same npm package name: `@mdwrk/lander-content-contract`.
- Repository source of truth: [https://github.com/groupsum/mdwrk-pages/tree/master/packages/lander/lander-content-contract](https://github.com/groupsum/mdwrk-pages/tree/master/packages/lander/lander-content-contract)
- Bridge releases from this repo emit an install-time deprecation warning so downstream users can migrate without an immediate package rename.

## Why
Use it when you need a content shape that is portable across compile-time, render-time, and source-content adapters.

## What
- Product, page, section, FAQ, schema, and navigation types.
- A shared content boundary for the entire lander family.
- The contract consumed by the compiler, React package, SEO helpers, and markdown adapter.

## Installation
Node.js 20.x through 22.x, matching the workspace engine contract in the root package manifest.

```bash
npm install @mdwrk/lander-content-contract
```

## Usage
```ts
import type { HeroSection, LanderSite } from "@mdwrk/lander-content-contract";

const hero: HeroSection = {
  id: "hero",
  kind: "hero",
  title: "MdWrk",
  subtitle: "Markdown workspace platform",
};

const site: LanderSite = {
  product: {
    name: "MdWrk",
    slug: "mdwrk",
    tagline: "Markdown workspace platform",
    description: "Portable markdown authoring and publishing.",
    category: "DeveloperTool",
    canonicalUrl: "https://mdwrk.com",
  },
  pages: [],
};
```

## Related
- [Packages index](../../README.md) - family and package navigation
- [Root README](../../../README.md) - repo overview
