# @mdwrk/mdwrkcom

**MdWrk public site application**

<p align="center">
  <a href="https://github.com/groupsum/markdown_workspace/blob/master/apps/mdwrkcom/README.md"><img alt="Hits" src="https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.apps_mdwrkcom_README&amp;left_text=hits" /></a>
  <a href="https://github.com/groupsum/markdown_workspace/releases"><img alt="Downloads" src="https://img.shields.io/github/downloads/groupsum/markdown_workspace/total?label=downloads" /></a>
  <a href="../../package.json"><img alt="Node" src="https://img.shields.io/badge/node-20.x%20%7C%2021.x%20%7C%2022.x-339933?logo=node.js&amp;logoColor=white" /></a>
  <a href="../../LICENSE"><img alt="License: Apache-2.0" src="https://img.shields.io/badge/license-Apache--2.0-blue.svg" /></a>
</p>

`@mdwrk/mdwrkcom` is the deployable app workspace for mdwrk.com, built on the lander and content-pack packages in this repository.

## Why
The public site is both a product surface and the first-party proving ground for the lander packages. This README connects the app to the reusable packages beneath it.

## What
- A deployable website app, not a reusable library package.
- Consumer of the lander content contract, compiler, SEO helpers, React components, and content pack.
- Home for mdwrk.com pages, compare pages, docs bridges, blog content, and generated discovery artifacts.

## Installation
Node.js 20.x through 22.x, matching the workspace engine contract in the root package manifest.

```bash
npm install
npm run dev:mdwrkcom
```

## Usage
```bash
npm run dev -w apps/mdwrkcom
npm run build -w apps/mdwrkcom
npm run ci -w apps/mdwrkcom
```

Treat this app as the first-party integration surface for the lander packages, not the only place the lander stack can be used.

## Related
- [Lander family](../../packages/lander/README.md) - reusable runtime and compile packages
- [Content pack](../../packages/content/mdwrkcom-content-pack/README.md) - source content distribution
- [Root README](../../README.md) - repo overview
