<div align="center">
# @mdwrk/structured-data
**Schema.org and JSON-LD helpers**
[![Hits](https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.packages_shared_structured_data_README&left_text=hits)](https://github.com/groupsum/markdown_workspace/blob/master/packages/shared/structured-data/README.md)
[![Downloads](https://img.shields.io/npm/dm/%40mdwrk%2Fstructured-data?label=downloads)](https://www.npmjs.com/package/@mdwrk/structured-data)
[![Node](https://img.shields.io/badge/node-20.x%20%7C%2021.x%20%7C%2022.x-339933?logo=node.js&logoColor=white)](../../../package.json)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](../../../LICENSE)
</div>

This package provides reusable Schema.org and JSON-LD builders for MdWrk apps, packages, public content, and discovery surfaces.

## Why
Use it when you need structured-data output without rewriting low-level Schema.org node creation logic.

## What
- Builders for WebPage, WebSite, FAQPage, SoftwareApplication, TechArticle, Product, Dataset, and more.
- Helpers for canonical ids and graph assembly.
- A shared discovery layer consumed heavily by the lander stack.

## Installation
Node.js 20.x through 22.x, matching the workspace engine contract in the root package manifest.

```bash
npm install @mdwrk/structured-data
```

## Usage
```ts
import { faqPageSchema, jsonLdGraph, softwareApplicationNode } from "@mdwrk/structured-data";

const graph = jsonLdGraph([
  softwareApplicationNode({ name: "MdWrk", url: "https://mdwrk.com" }),
  faqPageSchema({ items: [{ question: "What is MdWrk?", answer: "A markdown workspace platform." }] }),
]);
```

## Related
- [Packages index](../../README.md) - family and package navigation
- [Root README](../../../README.md) - repo overview
