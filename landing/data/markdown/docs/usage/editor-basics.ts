export const editorBasicsContent = `---
title: Editor Basics
toc: true
---
# Editor Basics

The MarkSpace editor provides a clean, distraction-free environment for your writing.

## The Interface
- **Editor Pane**: The left side (or main view on mobile) where you type Markdown.
- **Preview Pane**: The right side (desktop only) showing the rendered result.

## Writing
Simply type standard Markdown. The editor uses a monospace font to help align tables and code blocks.

## Auto-Save
MarkSpace uses an aggressive auto-save strategy.
- Every keystroke is debounced and saved to the local database.
- You never need to press \`Ctrl+S\`.

## Navigation
Use the sidebar to switch between documents (Coming soon in v2.1). Currently, the workspace manages a single active buffer state for the demo.`;