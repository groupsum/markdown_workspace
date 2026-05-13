# @mdwrk/lander-react

**React components for product landers**

<p align="center">
  <a href="https://github.com/groupsum/markdown_workspace/blob/master/packages/lander/lander-react/README.md"><img alt="Hits" src="https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.packages_lander_lander_react_README&amp;left_text=hits" /></a>
  <a href="https://www.npmjs.com/package/@mdwrk/lander-react"><img alt="Downloads" src="https://img.shields.io/npm/dm/%40mdwrk%2Flander-react?label=downloads" /></a>
  <a href="../../../package.json"><img alt="Node" src="https://img.shields.io/badge/node-20.x%20%7C%2021.x%20%7C%2022.x-339933?logo=node.js&amp;logoColor=white" /></a>
  <a href="../../../LICENSE"><img alt="License: Apache-2.0" src="https://img.shields.io/badge/license-Apache--2.0-blue.svg" /></a>
</p>

This package provides reusable React components for rendering compiled lander pages, breadcrumbs, FAQs, CTA sections, package grids, and JSON-LD graphs.

## Why
Use it when you want a render-time component layer on top of the lander content contract and compiler outputs.

## What
- Page shell and section rendering components.
- FAQ, breadcrumb, package-grid, and proof-matrix components.
- JSON-LD graph rendering wired to compiled site/page input.

## Installation
Node.js 20.x through 22.x, matching the workspace engine contract in the root package manifest.

```bash
npm install @mdwrk/lander-react @mdwrk/lander-core @mdwrk/lander-content-contract
```

## Usage
```tsx
import { LanderPage } from "@mdwrk/lander-react";

export function Page({ site, page }) {
  return <LanderPage site={site} page={page} />;
}
```

## Related
- [Packages index](../../README.md) - family and package navigation
- [Root README](../../../README.md) - repo overview
