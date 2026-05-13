# @mdwrk/lander-content-contract

**Portable site and page content types**

<p align="center">
  <a href="https://github.com/groupsum/markdown_workspace/blob/master/packages/lander/lander-content-contract/README.md"><img alt="Hits" src="https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.packages_lander_lander_content_contract_README&amp;left_text=hits" /></a>
  <a href="https://www.npmjs.com/package/@mdwrk/lander-content-contract"><img alt="Downloads" src="https://img.shields.io/npm/dm/%40mdwrk%2Flander-content-contract?label=downloads" /></a>
  <a href="../../../package.json"><img alt="Node" src="https://img.shields.io/badge/node-20.x%20%7C%2021.x%20%7C%2022.x-339933?logo=node.js&amp;logoColor=white" /></a>
  <a href="../../../LICENSE"><img alt="License: Apache-2.0" src="https://img.shields.io/badge/license-Apache--2.0-blue.svg" /></a>
</p>

This package defines the site, page, section, schema, navigation, and FAQ types used by MdWrk lander surfaces.

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
