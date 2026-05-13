# MdWrk Packages

**Reusable package catalog**

<p align="center">
  <a href="https://github.com/groupsum/markdown_workspace/blob/master/packages/README.md"><img alt="Hits" src="https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.packages_README&amp;left_text=hits" /></a>
  <a href="https://github.com/groupsum/markdown_workspace/releases"><img alt="Downloads" src="https://img.shields.io/github/downloads/groupsum/markdown_workspace/total?label=downloads" /></a>
  <a href="../package.json"><img alt="Node" src="https://img.shields.io/badge/node-20.x%20%7C%2021.x%20%7C%2022.x-339933?logo=node.js&amp;logoColor=white" /></a>
  <a href="../LICENSE"><img alt="License: Apache-2.0" src="https://img.shields.io/badge/license-Apache--2.0-blue.svg" /></a>
</p>

The `packages/` tree contains the reusable MdWrk libraries that power authoring, rendering, theming, extensions, lander delivery, and shared primitives.

## Why
Well-trafficked package repos treat the package map like a product catalog. This index helps readers move from the repo overview to the exact family or package they need.

## What
- `contracts/` for extension and theme API contracts.
- `renderer/` for markdown parsing and React rendering surfaces.
- `editor/` for source-mode and in-renderer editing surfaces.
- `extensions/` for runtime and first-party bundled extensions.
- `shared/` for tokens, icons, i18n, testing, and structured-data helpers.
- `lander/` and `content/` for public-site composition and content delivery.

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

## Related
- [Root README](../README.md) - repo overview
- [Examples](../examples/README.md) - external-consumer validation
- [npm org](https://www.npmjs.com/org/mdwrk) - published package scope
