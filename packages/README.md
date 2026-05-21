<div align="center">
# MdWrk Packages
**Reusable package catalog**
[![Hits](https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.packages_README&left_text=hits)](https://github.com/groupsum/markdown_workspace/blob/master/packages/README.md)
[![Downloads](https://img.shields.io/github/downloads/groupsum/markdown_workspace/total?label=downloads)](https://github.com/groupsum/markdown_workspace/releases)
[![Node](https://img.shields.io/badge/node-20.x%20%7C%2021.x%20%7C%2022.x-339933?logo=node.js&logoColor=white)](../package.json)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](../LICENSE)
</div>

The `packages/` tree contains the reusable MdWrk libraries that power authoring, rendering, theming, extensions, lander delivery, and shared primitives.

## Why
Well-trafficked package repos treat the package map like a product catalog. This index helps readers move from the repo overview to the exact family or package they need.

## What
- `contracts/`, `renderer/`, `editor/`, `extensions/`, and most `shared/` packages now bridge to extracted maintenance repos while keeping the same npm package names.
- `lander/`, `@mdwrk/structured-data`, and `@mdwrk/page-template-demo-content-pack` bridge to `groupsum/mdwrk-pages`.
- `@mdwrk/mdwrkcom-content-pack` moved to its new source-of-truth home in `mdwrkcom`.

## Installation
Node.js 20.x through 22.x, matching the workspace engine contract in the root package manifest.

```bash
npm install
npm run build
```

## Usage
Pick a family first, then move to a concrete package README for install and API details.

- [Contracts](./contracts/README.md)
- [Renderer](./renderer/README.md)
- [Editor](./editor/README.md)
- [Extensions](./extensions/README.md)
- [Shared](./shared/README.md)
- [Lander](./lander/README.md)
- [Content](./content/README.md)

## Maintenance Status
- Use the package READMEs in this repo as legacy bridge docs for packages that have moved.
- The active source repos are `groupsum/mdwrk` for renderer/editor/contracts/extensions/shared packages and `groupsum/mdwrk-pages` for lander, structured-data, and page-template-demo-content-pack packages.
- `@mdwrk/mdwrkcom-content-pack` no longer lives in this repo; this path now exists only as a relocation note.

## Related
- [Root README](../README.md) - repo overview
- [Examples](../examples/README.md) - external-consumer validation
- [npm org](https://www.npmjs.com/org/mdwrk) - published package scope
