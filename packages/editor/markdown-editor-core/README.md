# @mdwrk/markdown-editor-core

**Headless markdown editing primitives**

<p align="center">
  <a href="https://github.com/groupsum/markdown_workspace/blob/master/packages/editor/markdown-editor-core/README.md"><img alt="Hits" src="https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.packages_editor_markdown_editor_core_README&amp;left_text=hits" /></a>
  <a href="https://www.npmjs.com/package/@mdwrk/markdown-editor-core"><img alt="Downloads" src="https://img.shields.io/npm/dm/%40mdwrk%2Fmarkdown-editor-core?label=downloads" /></a>
  <a href="../../../package.json"><img alt="Node" src="https://img.shields.io/badge/node-20.x%20%7C%2021.x%20%7C%2022.x-339933?logo=node.js&amp;logoColor=white" /></a>
  <a href="../../../LICENSE"><img alt="License: Apache-2.0" src="https://img.shields.io/badge/license-Apache--2.0-blue.svg" /></a>
</p>

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
