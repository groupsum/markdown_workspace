<div align="center">
# @mdwrk/lander-markdown-content-adapter
**Markdown and frontmatter adapter**
[![Hits](https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.packages_lander_lander_markdown_content_adapter_README&left_text=hits)](https://github.com/groupsum/markdown_workspace/blob/master/packages/lander/lander-markdown-content-adapter/README.md)
[![Downloads](https://img.shields.io/npm/dm/%40mdwrk%2Flander-markdown-content-adapter?label=downloads)](https://www.npmjs.com/package/@mdwrk/lander-markdown-content-adapter)
[![Node](https://img.shields.io/badge/node-20.x%20%7C%2021.x%20%7C%2022.x-339933?logo=node.js&logoColor=white)](../../../package.json)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](../../../LICENSE)
</div>

This package converts frontmatter-plus-body markdown into lander page specs.

## Why
Use it when your source of truth is markdown files and you still want to target the lander content contract cleanly.

## What
- Frontmatter splitting and simple parsing.
- Markdown body adaptation into a page-spec structure.
- A bridge between source markdown files and the lander compiler.

## Installation
Node.js 20.x through 22.x, matching the workspace engine contract in the root package manifest.

```bash
npm install @mdwrk/lander-markdown-content-adapter @mdwrk/lander-core
```

## Usage
```ts
import { markdownToPageSpec } from "@mdwrk/lander-markdown-content-adapter";

const parsed = markdownToPageSpec("---\ntitle: Hello\nslug: /hello/\n---\nMdWrk body copy.");
```

## Related
- [Packages index](../../README.md) - family and package navigation
- [Root README](../../../README.md) - repo overview
