# @mdwrk/markdown-renderer-core

**Headless markdown rendering core**

<p align="center">
  <a href="https://github.com/groupsum/markdown_workspace/blob/master/packages/renderer/markdown-renderer-core/README.md"><img alt="Hits" src="https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.packages_renderer_markdown_renderer_core_README&amp;left_text=hits" /></a>
  <a href="https://www.npmjs.com/package/@mdwrk/markdown-renderer-core"><img alt="Downloads" src="https://img.shields.io/npm/dm/%40mdwrk%2Fmarkdown-renderer-core?label=downloads" /></a>
  <a href="../../../package.json"><img alt="Node" src="https://img.shields.io/badge/node-20.x%20%7C%2021.x%20%7C%2022.x-339933?logo=node.js&amp;logoColor=white" /></a>
  <a href="../../../LICENSE"><img alt="License: Apache-2.0" src="https://img.shields.io/badge/license-Apache--2.0-blue.svg" /></a>
</p>

This package provides self-contained markdown parsing, profile handling, heading extraction, HTML rendering, and full HTML document generation for MdWrk consumers.

## Why
Use it when you need markdown output without pulling in React.

## What
- Synchronous and asynchronous markdown-to-HTML rendering helpers.
- Heading extraction, slug generation, frontmatter helpers, and profile support.
- HTML document generation for standalone output.

## Installation
Node.js 20.x through 22.x, matching the workspace engine contract in the root package manifest.

```bash
npm install @mdwrk/markdown-renderer-core
```

## Usage
```ts
import { renderMarkdownToHtmlSync } from "@mdwrk/markdown-renderer-core";

const html = renderMarkdownToHtmlSync("# Hello\n\nMdWrk renderer core.", {
  profile: "gfm-default",
  htmlHandling: "escape",
});
```

## Related
- [Packages index](../../README.md) - family and package navigation
- [Root README](../../../README.md) - repo overview
