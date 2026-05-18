# MdWrk Lander

**Portable content, compile, SEO, theme, and React surfaces**

<p align="center">
  <a href="https://github.com/groupsum/markdown_workspace/blob/master/packages/lander/README.md"><img alt="Hits" src="https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.packages_lander_README&amp;left_text=hits" /></a>
  <a href="https://github.com/groupsum/markdown_workspace/releases"><img alt="Downloads" src="https://img.shields.io/github/downloads/groupsum/markdown_workspace/total?label=downloads" /></a>
  <a href="../../package.json"><img alt="Node" src="https://img.shields.io/badge/node-20.x%20%7C%2021.x%20%7C%2022.x-339933?logo=node.js&amp;logoColor=white" /></a>
  <a href="../../LICENSE"><img alt="License: Apache-2.0" src="https://img.shields.io/badge/license-Apache--2.0-blue.svg" /></a>
</p>

The lander family packages the content model, compilation pipeline, SEO output, theme defaults, markdown adapters, and React components used for product landing sites.

## Why
The lander stack is intentionally modular. This index separates content contracts, compile-time logic, output helpers, and runtime rendering.

## What
- `@mdwrk/lander-content-contract` for site, page, section, and schema shapes.
- `@mdwrk/lander-core` for compile, validation, sitemap, robots, and llms.txt generation.
- `@mdwrk/lander-seo` for metadata and scoring helpers.
- `@mdwrk/lander-theme` for default styles and tokens.
- `@mdwrk/lander-react` for UI components and JSON-LD output.
- `@mdwrk/lander-markdown-content-adapter` for frontmatter-driven markdown ingestion.
- `@mdwrk/lander-page-templates` for reusable page recipes, semantic relationships, and PageSpec generation.
- `@mdwrk/lander-page-template-presets` for ready-made graph starters built from reusable page templates.

## Installation
Node.js 20.x through 22.x, matching the workspace engine contract in the root package manifest.

```bash
npm install @mdwrk/lander-content-contract @mdwrk/lander-core @mdwrk/lander-seo @mdwrk/lander-theme @mdwrk/lander-react @mdwrk/lander-markdown-content-adapter @mdwrk/lander-page-templates @mdwrk/lander-page-template-presets
```

## Usage
Start with the content contract and core compiler, then add SEO, theming, markdown adapters, or React surfaces as needed.

- [lander-content-contract](./lander-content-contract/README.md)
- [lander-core](./lander-core/README.md)
- [lander-seo](./lander-seo/README.md)
- [lander-theme](./lander-theme/README.md)
- [lander-react](./lander-react/README.md)
- [lander-markdown-content-adapter](./lander-markdown-content-adapter/README.md)
- [lander-page-templates](./lander-page-templates/README.md)
- [lander-page-template-presets](./lander-page-template-presets/README.md)

## Related
- [Content family](../content/README.md) - MdWrk content pack
- [mdwrk.com app](../../apps/mdwrkcom/README.md) - first-party consumer
