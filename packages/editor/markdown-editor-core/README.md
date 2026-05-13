<div align="center">
# @mdwrk/markdown-editor-core
**Headless markdown editing primitives**
[![Hits](https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.packages_editor_markdown_editor_core_README&left_text=hits)](https://github.com/groupsum/markdown_workspace/blob/master/packages/editor/markdown-editor-core/README.md)
[![Downloads](https://img.shields.io/npm/dm/%40mdwrk%2Fmarkdown-editor-core?label=downloads)](https://www.npmjs.com/package/@mdwrk/markdown-editor-core)
[![Node](https://img.shields.io/badge/node-20.x%20%7C%2021.x%20%7C%2022.x-339933?logo=node.js&logoColor=white)](../../../package.json)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](../../../LICENSE)
</div>

This package exposes the command, selection, transform, and history logic behind the MdWrk editing experience.

## Why
Use it when you need markdown editing semantics without committing to a specific UI implementation.

## What
- Built-in markdown editing commands.
- Selection and transform helpers.
- Undo and redo history state management.

## Installation
Node.js 20.x through 22.x, matching the workspace engine contract in the root package manifest.

```bash
npm install @mdwrk/markdown-editor-core
```

## Usage
```ts
import { applyBuiltinMarkdownCommand, createSelection } from "@mdwrk/markdown-editor-core";

const result = applyBuiltinMarkdownCommand(
  "bold",
  "hello",
  createSelection(0, 5),
);
```

## Related
- [Packages index](../../README.md) - family and package navigation
- [Root README](../../../README.md) - repo overview
