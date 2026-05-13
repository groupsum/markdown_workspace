# MdWrk Content Packs

**Published content distributions**

<p align="center">
  <a href="https://github.com/groupsum/markdown_workspace/blob/master/packages/content/README.md"><img alt="Hits" src="https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.packages_content_README&amp;left_text=hits" /></a>
  <a href="https://github.com/groupsum/markdown_workspace/releases"><img alt="Downloads" src="https://img.shields.io/github/downloads/groupsum/markdown_workspace/total?label=downloads" /></a>
  <a href="../../package.json"><img alt="Node" src="https://img.shields.io/badge/node-20.x%20%7C%2021.x%20%7C%2022.x-339933?logo=node.js&amp;logoColor=white" /></a>
  <a href="../../LICENSE"><img alt="License: Apache-2.0" src="https://img.shields.io/badge/license-Apache--2.0-blue.svg" /></a>
</p>

The content family packages source markdown, public assets, sitemap definitions, and generated discovery artifacts for MdWrk public-site delivery.

## Why
A content pack is not the same thing as the lander runtime. This README makes the distinction clear and points to the package that ships content itself.

## What
- `@mdwrk/mdwrkcom-content-pack` as the first-party content distribution consumed by the mdwrk.com app and related tooling.

## Installation
Node.js 20.x through 22.x, matching the workspace engine contract in the root package manifest.

```bash
npm install @mdwrk/mdwrkcom-content-pack
```

## Usage
Use the content pack when you need the source content tree and generated discovery assets as a package boundary, not just live files in the repo.

- [mdwrkcom-content-pack](./mdwrkcom-content-pack/README.md)

## Related
- [Lander family](../lander/README.md) - runtime and compile surfaces
- [mdwrk.com app](../../apps/mdwrkcom/README.md) - site consumer
