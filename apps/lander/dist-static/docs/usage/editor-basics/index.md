# Editor Basics

MdWrk combines a markdown source editor, split preview workflow, table builder, formatting toolbar, and local-first workspace model so drafting stays fast without hiding the underlying Markdown.

## What the Editor Is For

MdWrk is built for direct Markdown authoring with immediate visual feedback. The editor stays plain-text first, but it removes a lot of the friction that usually makes Markdown feel slower than rich-text tools.

The client combines `@mdwrk/markdown-editor-react` for source editing and `@mdwrk/markdown-renderer-react` for preview, so writing and reading stay in the same workspace flow.

## Core Writing Views

MdWrk supports three primary work modes:

- editor-only for focused drafting
- split view for writing while checking rendered output
- preview-only for review, presentation, and export inspection

Split view includes a draggable divider and keyboard-adjustable separator so the balance between source and preview can be changed without leaving the work surface.

## Source Editing Features

The editor surface currently provides:

- controlled and uncontrolled document modes
- live cursor and selection tracking
- line-number gutter support
- undo and redo history
- keyboard shortcut support
- toolbar command execution
- selection-aware formatting state for bold, italic, strikethrough, bullet lists, and task lists

The result is a Markdown editor that still behaves like a real text editor instead of a fragile overlay on top of rich text.

## Formatting Toolbar

The default work-pane toolbar exposes direct authoring controls for:

- bold
- italic
- strikethrough
- bullet lists
- task lists
- indent
- outdent
- inline math
- footnotes
- superscript
- subscript
- undo
- redo
- insert table

MdWrk writes Markdown for these actions instead of storing proprietary formatting state.

## Keyboard Behavior

The editor adds a few opinionated behaviors that improve drafting speed:

- `Ctrl/Cmd+B` applies bold markers
- `Ctrl/Cmd+I` applies italic markers
- `Ctrl/Cmd+Shift+X` applies strikethrough markers
- `Ctrl/Cmd+Z` and `Ctrl/Cmd+Shift+Z` drive undo and redo
- `Tab` indents the current line or selected block
- `Shift+Tab` outdents the current line or selected block
- `Enter` continues unordered, ordered, and task lists
- `Enter` on an empty list item exits the list cleanly

These behaviors are especially useful for notes, checklists, changelogs, and long structured documents.

## Table Builder

MdWrk includes a table builder in the work-pane toolbar. Instead of hand-building the first pipe grid, you can choose row and column counts and insert a ready-to-edit Markdown table.

```markdown
| Column 1 | Column 2 | Column 3 |
| --- | --- | --- |
| R1C1 | R1C2 | R1C3 |
| R2C1 | R2C2 | R2C3 |
```

After insertion, the table remains ordinary Markdown and can be edited anywhere.

## Workspace Model

Documents live in browser-managed local storage unless you intentionally connect another surface such as GitHub sync or export. This keeps drafting private by default and lets the editor continue working when network access is unavailable.

Common workspace operations include:

- creating files and folders
- renaming entries
- deleting obsolete content
- switching between projects
- keeping multiple Markdown documents available for internal linking and navigation

## Theme and Layout Behavior

The editor follows the shared viewport and aspect-ratio contract used across the workspace. Themes can style each breakpoint band differently, but the editing and preview layout rules stay predictable across portrait, square, landscape, wide, and ultra-wide usage.

## Why This Matters

MdWrk is not trying to hide Markdown behind a fake document model. The product goal is to make Markdown fast enough for daily writing while keeping the file portable, inspectable, and easy to move into GitHub, static documentation, package READMEs, or other publishing surfaces.

## Related Docs

- [Advanced Markdown Formatting](/docs/usage/advanced-formatting)
- [Rendering And Preview](/docs/usage/rendering-and-preview)
- [Client Configuration](/docs/getting-started/configuration)

## Frequently Asked Questions

### What will I learn from Editor Basics?

MdWrk combines a markdown source editor, split preview workflow, table builder, formatting toolbar, and local-first workspace model so drafting stays fast without hiding the underlying Markdown.

### Who should read Editor Basics?

Read this page if you need practical MdWrk guidance for editor basics, including the relevant workflow, product surface, and follow-up documentation paths.
