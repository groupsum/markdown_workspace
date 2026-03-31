# Editor basic example

This example validates the public `@mdwrk/markdown-editor-react` and `@mdwrk/markdown-renderer-react` package surfaces without relying on private workspace wiring.

It demonstrates:

- list continuation for ordered, unordered, and task lists
- task list insertion via the public editor command handle
- line-number toggling through the package `showLineNumbers` prop
- public theme support through `createMarkdownEditorThemeStyle()` and `createMarkdownRendererThemeStyle()`
- optional profile toggles for definition lists, math, and footnotes
- renderer-backed preview using the shared Markdown runtime

Public APIs exercised:

- `MarkdownSourceEditor`
- `MarkdownSourceEditorHandle.executeCommand()`
- `createMarkdownEditorThemeStyle()`
- `MarkdownRenderer`
- `createMarkdownRendererThemeStyle()`
