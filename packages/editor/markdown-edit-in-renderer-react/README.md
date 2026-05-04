# @mdwrk/markdown-edit-in-renderer-react

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
