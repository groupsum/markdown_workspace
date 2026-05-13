# @mdwrk/markdown-edit-in-renderer-react

**In-place markdown block editing for React**

<p align="center">
  <a href="https://github.com/groupsum/markdown_workspace/blob/master/packages/editor/markdown-edit-in-renderer-react/README.md"><img alt="Hits" src="https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.packages_editor_markdown_edit_in_renderer_react_README&amp;left_text=hits" /></a>
  <a href="https://www.npmjs.com/package/@mdwrk/markdown-edit-in-renderer-react"><img alt="Downloads" src="https://img.shields.io/npm/dm/%40mdwrk%2Fmarkdown-edit-in-renderer-react?label=downloads" /></a>
  <a href="../../../package.json"><img alt="Node" src="https://img.shields.io/badge/node-20.x%20%7C%2021.x%20%7C%2022.x-339933?logo=node.js&amp;logoColor=white" /></a>
  <a href="../../../LICENSE"><img alt="License: Apache-2.0" src="https://img.shields.io/badge/license-Apache--2.0-blue.svg" /></a>
</p>

This package keeps markdown in the rendered document flow, activates individual blocks in place, and emits full-document markdown updates.

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
