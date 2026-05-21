<div align="center">
# @mdwrk/lander-react
**React components for product landers**
[![Hits](https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.packages_lander_lander_react_README&left_text=hits)](https://github.com/groupsum/markdown_workspace/blob/master/packages/lander/lander-react/README.md)
[![Downloads](https://img.shields.io/npm/dm/%40mdwrk%2Flander-react?label=downloads)](https://www.npmjs.com/package/@mdwrk/lander-react)
[![Node](https://img.shields.io/badge/node-20.x%20%7C%2021.x%20%7C%2022.x-339933?logo=node.js&logoColor=white)](../../../package.json)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](../../../LICENSE)
</div>

This package provides reusable React components for rendering compiled lander pages, breadcrumbs, FAQs, CTA sections, package grids, and JSON-LD graphs.

## Maintenance Status
This is a legacy bridge package in `groupsum/markdown_workspace`.

- Active maintenance moved to `groupsum/mdwrk-pages`.
- Install compatibility remains on the same npm package name: `@mdwrk/lander-react`.
- Repository source of truth: [https://github.com/groupsum/mdwrk-pages/tree/master/packages/lander/lander-react](https://github.com/groupsum/mdwrk-pages/tree/master/packages/lander/lander-react)
- Bridge releases from this repo emit an install-time deprecation warning so downstream users can migrate without an immediate package rename.

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
