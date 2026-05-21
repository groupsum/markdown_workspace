<div align="center">
# MdWrk Content Packs
**Published content distributions**
[![Hits](https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.packages_content_README&left_text=hits)](https://github.com/groupsum/markdown_workspace/blob/master/packages/content/README.md)
[![Downloads](https://img.shields.io/github/downloads/groupsum/markdown_workspace/total?label=downloads)](https://github.com/groupsum/markdown_workspace/releases)
[![Node](https://img.shields.io/badge/node-20.x%20%7C%2021.x%20%7C%2022.x-339933?logo=node.js&logoColor=white)](../../package.json)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](../../LICENSE)
</div>

The content family packages source markdown, public assets, sitemap definitions, and generated discovery artifacts for MdWrk public-site delivery.

## Why
A content pack is not the same thing as the lander runtime. This README makes the distinction clear and points to the package that ships content itself.

## What
- a relocation note for `@mdwrk/mdwrkcom-content-pack`, whose new source-of-truth home is `mdwrkcom`.

## Installation
Node.js 20.x through 22.x, matching the workspace engine contract in the root package manifest.

```bash
npm install @mdwrk/mdwrkcom-content-pack
```

## Usage
Use the content pack from its new `mdwrkcom` repo when you need the source content tree and generated discovery assets as a package boundary, not just live files in the old monorepo.

- [mdwrkcom-content-pack](./mdwrkcom-content-pack/README.md)

## Related
- [Lander family](../lander/README.md) - runtime and compile surfaces
- `mdwrkcom` - new content-pack source-of-truth repo
