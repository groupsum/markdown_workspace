<div align="center">
# @mdwrk/markdown-renderer-react
**React markdown renderer component**
[![Hits](https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.packages_renderer_markdown_renderer_react_README&left_text=hits)](https://github.com/groupsum/markdown_workspace/blob/master/packages/renderer/markdown-renderer-react/README.md)
[![Downloads](https://img.shields.io/npm/dm/%40mdwrk%2Fmarkdown-renderer-react?label=downloads)](https://www.npmjs.com/package/@mdwrk/markdown-renderer-react)
[![Node](https://img.shields.io/badge/node-20.x%20%7C%2021.x%20%7C%2022.x-339933?logo=node.js&logoColor=white)](../../../package.json)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](../../../LICENSE)
</div>

This package wraps the MdWrk renderer core in a React component with theme styles and link-interaction hooks.

## Maintenance Status
This is a legacy bridge package in `groupsum/markdown_workspace`.

- Active maintenance moved to `groupsum/mdwrk`.
- Install compatibility remains on the same npm package name: `@mdwrk/markdown-renderer-react`.
- Repository source of truth: [https://github.com/groupsum/mdwrk/tree/master/packages/renderer/markdown-renderer-react](https://github.com/groupsum/mdwrk/tree/master/packages/renderer/markdown-renderer-react)
- Bridge releases from this repo emit an install-time deprecation warning so downstream users can migrate without an immediate package rename.

## Why
Use it when you want markdown rendering as a React component instead of a headless HTML string pipeline.

## What
- A `MarkdownRenderer` React component.
- Theme-style helpers for renderer output.
- Link click interception and attribute injection hooks.

## Installation
Node.js 20.x through 22.x, matching the workspace engine contract in the root package manifest.

```bash
npm install @mdwrk/markdown-renderer-react @mdwrk/markdown-renderer-core
```

## Usage
```tsx
import { MarkdownRenderer } from "@mdwrk/markdown-renderer-react";
import "@mdwrk/markdown-renderer-react/styles/default.css";

export function Preview() {
  return <MarkdownRenderer markdown={"# Hello\n\nRendered with MdWrk."} />;
}
```

## Related
- [Packages index](../../README.md) - family and package navigation
- [Root README](../../../README.md) - repo overview
