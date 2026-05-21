<div align="center">
# @mdwrk/markdown-edit-in-renderer-react
**In-place markdown block editing for React**
[![Hits](https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.packages_editor_markdown_edit_in_renderer_react_README&left_text=hits)](https://github.com/groupsum/markdown_workspace/blob/master/packages/editor/markdown-edit-in-renderer-react/README.md)
[![Downloads](https://img.shields.io/npm/dm/%40mdwrk%2Fmarkdown-edit-in-renderer-react?label=downloads)](https://www.npmjs.com/package/@mdwrk/markdown-edit-in-renderer-react)
[![Node](https://img.shields.io/badge/node-20.x%20%7C%2021.x%20%7C%2022.x-339933?logo=node.js&logoColor=white)](../../../package.json)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](../../../LICENSE)
</div>

This package keeps markdown in the rendered document flow, activates individual blocks in place, and emits full-document markdown updates.

## Maintenance Status
This is a legacy bridge package in `groupsum/markdown_workspace`.

- Active maintenance moved to `groupsum/mdwrk`.
- Install compatibility remains on the same npm package name: `@mdwrk/markdown-edit-in-renderer-react`.
- Repository source of truth: [https://github.com/groupsum/mdwrk/tree/master/packages/editor/markdown-edit-in-renderer-react](https://github.com/groupsum/mdwrk/tree/master/packages/editor/markdown-edit-in-renderer-react)
- Bridge releases from this repo emit an install-time deprecation warning so downstream users can migrate without an immediate package rename.

## Why
Use it when you want Typora-style authoring without splitting the document into a separate source-only surface.

## What
- Rendered markdown with block activation.
- Source editor activation only where the user is editing.
- Integration with the MdWrk renderer and editor packages instead of a second parsing model.

## Installation
Node.js 20.x through 22.x, matching the workspace engine contract in the root package manifest.

```bash
npm install @mdwrk/markdown-edit-in-renderer-react @mdwrk/markdown-renderer-react @mdwrk/markdown-editor-react
```

## Usage
```tsx
import { MarkdownEditInRenderer } from "@mdwrk/markdown-edit-in-renderer-react";
import "@mdwrk/markdown-renderer-react/styles/default.css";
import "@mdwrk/markdown-editor-react/styles/default.css";
import "@mdwrk/markdown-edit-in-renderer-react/styles/default.css";

export function DocumentEditor() {
  return (
    <MarkdownEditInRenderer
      defaultValue={"# Draft\n\nClick a block to edit it."}
      onChange={(markdown) => console.log(markdown)}
    />
  );
}
```

## Related
- [Packages index](../../README.md) - family and package navigation
- [Root README](../../../README.md) - repo overview
