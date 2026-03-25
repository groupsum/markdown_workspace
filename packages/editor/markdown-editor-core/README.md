# @mdwrk/markdown-editor-core

Portable source-mode markdown editor primitives for Markdown Workspace.

## Responsibilities

- document snapshot and selection types
- selection transforms
- formatting commands
- indent/outdent helpers
- undo/redo history state
- host-facing editor controller contracts

## Scope

This package does not depend on React or DOM rendering. It is suitable for browser hosts, React bindings, and future non-React adapters.

## Key exports

- `createHistoryState`
- `resetHistoryState`
- `pushHistoryEntry`
- `undoHistory`
- `redoHistory`
- `applyBuiltinMarkdownCommand`
- `wrapSelection`
- `indentSelection`
- `outdentSelection`
- `computeCursorPosition`
- `DEFAULT_MARKDOWN_EDITOR_CLASS_NAMES`

## Status

Implemented in the Phase 5 checkpoint. This package is publishable, but repository-wide certification is still pending later phases.
