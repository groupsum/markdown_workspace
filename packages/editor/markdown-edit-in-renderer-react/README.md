# @mdwrk/markdown-edit-in-renderer-react

[![Hits](https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.packages.editor.markdown_edit_in_renderer_react.readme&left_text=hits)](https://github.com/groupsum/markdown_workspace/blob/master/packages/editor/markdown-edit-in-renderer-react/README.md)
[![Downloads](https://img.shields.io/npm/dm/%40mdwrk%2Fmarkdown-edit-in-renderer-react?label=downloads)](https://www.npmjs.com/package/@mdwrk/markdown-edit-in-renderer-react)

Typora-style React editing surface for MdWrk. It keeps markdown in the rendered document flow, activates individual source blocks in place, and emits whole-document markdown updates.

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

The package depends on the existing MdWrk renderer and editor packages. It does not introduce a second markdown parser or a standalone editing model.
