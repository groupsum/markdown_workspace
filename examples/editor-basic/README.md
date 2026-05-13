# Editor basic example

[![Hits](https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.examples.editor_basic.readme&left_text=hits)](https://github.com/groupsum/markdown_workspace/blob/master/examples/editor-basic/README.md)
[![Downloads](https://img.shields.io/github/downloads/groupsum/markdown_workspace/total?label=downloads)](https://github.com/groupsum/markdown_workspace/releases)

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
