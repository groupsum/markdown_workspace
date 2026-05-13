# @mdwrk/markdown-renderer-react

**React markdown renderer component**

<p align="center">
  <a href="https://github.com/groupsum/markdown_workspace/blob/master/packages/renderer/markdown-renderer-react/README.md"><img alt="Hits" src="https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.packages_renderer_markdown_renderer_react_README&amp;left_text=hits" /></a>
  <a href="https://www.npmjs.com/package/@mdwrk/markdown-renderer-react"><img alt="Downloads" src="https://img.shields.io/npm/dm/%40mdwrk%2Fmarkdown-renderer-react?label=downloads" /></a>
  <a href="../../../package.json"><img alt="Node" src="https://img.shields.io/badge/node-20.x%20%7C%2021.x%20%7C%2022.x-339933?logo=node.js&amp;logoColor=white" /></a>
  <a href="../../../LICENSE"><img alt="License: Apache-2.0" src="https://img.shields.io/badge/license-Apache--2.0-blue.svg" /></a>
</p>

This package wraps the MdWrk renderer core in a React component with theme styles and link-interaction hooks.

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
