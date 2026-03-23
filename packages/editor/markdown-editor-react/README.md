# @markdown-workspace/markdown-editor-react

React bindings for the portable Markdown Workspace source-mode editor.

## Responsibilities

- `MarkdownSourceEditor` React component
- controlled and uncontrolled value modes
- textarea selection + cursor synchronization
- keyboard shortcuts and built-in command wiring
- undo/redo integration on top of the core package
- theme variable bridge and optional default stylesheet

## Key exports

- `MarkdownSourceEditor`
- `createMarkdownEditorThemeStyle`
- `createMarkdownEditorThemeVariablesFromThemeTokens`
- `createMarkdownEditorThemeStyleFromThemeTokens`
- `useMarkdownSourceEditorTheme`
- `MarkdownSourceEditorHandle`
- re-exports from `@markdown-workspace/markdown-editor-core`

## Optional stylesheet

```css
@import url("@markdown-workspace/markdown-editor-react/styles/default.css");
```

## Status

Implemented in the Phase 9 checkpoint. The package is publishable. Repository-wide certification remains pending later phases.
