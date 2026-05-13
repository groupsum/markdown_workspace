<div align="center">
# @mdwrk/markdown-editor-react
**React source editor component**
[![Hits](https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.packages_editor_markdown_editor_react_README&left_text=hits)](https://github.com/groupsum/markdown_workspace/blob/master/packages/editor/markdown-editor-react/README.md)
[![Downloads](https://img.shields.io/npm/dm/%40mdwrk%2Fmarkdown-editor-react?label=downloads)](https://www.npmjs.com/package/@mdwrk/markdown-editor-react)
[![Node](https://img.shields.io/badge/node-20.x%20%7C%2021.x%20%7C%2022.x-339933?logo=node.js&logoColor=white)](../../../package.json)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](../../../LICENSE)
</div>

This package provides the textarea-based MdWrk source editor component on top of the editor core primitives.

## Why
Use it when you need a React authoring surface with built-in commands, line numbers, selection handling, and history.

## What
- A `MarkdownSourceEditor` React component.
- Theme-style helpers and public editor types.
- Re-exported editor-core primitives for convenience.

## Installation
Node.js 20.x through 22.x, matching the workspace engine contract in the root package manifest.

```bash
npm install @mdwrk/markdown-editor-react @mdwrk/markdown-editor-core
```

## Usage
```tsx
import { MarkdownSourceEditor } from "@mdwrk/markdown-editor-react";
import "@mdwrk/markdown-editor-react/styles/default.css";

export function Editor() {
  return <MarkdownSourceEditor defaultValue={"# Draft\n\nStart typing..."} />;
}
```

## Related
- [Packages index](../../README.md) - family and package navigation
- [Root README](../../../README.md) - repo overview
