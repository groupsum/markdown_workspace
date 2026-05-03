---
title: Markdown Formatting
slug: usage/advanced-formatting
section: Product
sectionOrder: 2
order: 2
toc: true
date: 2026-05-03
status: published
excerpt: MdWrk uses a CommonMark plus GFM baseline, exposes optional formatting profiles for footnotes, math, and related syntax, and adds opinionated editor tools for faster authoring without locking documents into a proprietary format.
---
## Quick Reference

Use this article to understand Markdown Formatting in the MdWrk Product surface. MdWrk uses a CommonMark plus GFM baseline, exposes optional formatting profiles for footnotes, math, and related syntax, and adds opinionated editor tools for faster authoring without locking documents into a proprietary format.

Key concepts covered here:

- local Markdown files
- live preview
- theme portability

Useful follow-up pages:

- [Local-First Markdown Workspace](/docs/product/local-first-markdown-workspace)
- [Markdown Preview Editor](/docs/product/markdown-preview-editor)
- [Editor Basics](/docs/usage/editor-basics)

Use this page when you want the exact Markdown formatting contract that MdWrk previews, exports, and edits today.

## Baseline Conformance

The repository default remains **CommonMark 0.31.2 + GFM 0.29-gfm**.

That means MdWrk treats standard Markdown as the primary portable surface for:

- headings
- paragraphs
- emphasis
- strong emphasis
- links
- images
- blockquotes
- thematic breaks
- inline code
- fenced code blocks
- ordered and unordered lists
- GitHub-style task lists
- GitHub-style tables
- strikethrough

```markdown
# Product Overview

MdWrk keeps drafting local by default.

> Preview and source stay aligned.

- local-first editing
- portable Markdown output
- optional sync later

| Surface | Status |
| :--- | :--- |
| Editor | Ready |
| Preview | Ready |

- [x] Draft
- [ ] Publish
```

## What the Renderer Guarantees

The same renderer family powers the MdWrk preview surface and this lander, so the formatting contract is shared across documentation and the client.

- Front matter is parsed into metadata and omitted from rendered body output.
- Heading extraction is available for table-of-contents and navigation surfaces.
- GFM task list items render as semantic checkbox rows.
- GFM tables render as semantic table markup.
- Fenced code blocks render into portable code block containers with a header/surface structure.
- HTML export and full HTML document generation preserve the same Markdown render contract.

## Optional Markdown Profiles

MdWrk keeps the CommonMark plus GFM baseline on by default. Optional profiles can be enabled from the Markdown profile settings when a document needs more expressive syntax.

### In-Scope Profiles

- `front-matter`: YAML-style metadata blocks are parsed into document metadata and removed from rendered body content.
- `footnotes`: Footnote references and definitions render into linked footnote sections.
- `definition-lists`: Definition list syntax renders into `dl`, `dt`, and `dd` structures.
- `math`: Inline and block math are structurally recognized. This checkpoint does not typeset equations with KaTeX or MathJax.
- `superscript`: Caret-based superscript syntax is supported when the profile is enabled.
- `subscript`: Tilde-based subscript syntax is supported when the profile is enabled.
- `smart-punctuation`: Smart punctuation transforms are available when explicitly enabled.

### Experimental or Out-of-Boundary Profiles

- `citations`: Citation keys are recognized structurally, but bibliography resolution is still outside the certified formatting boundary.
- `markdown-in-html`: Markdown inside trusted HTML containers is available only when that profile is enabled and trusted HTML preview/export is also enabled.

## Trusted HTML Rule

Trusted HTML is off by default.

Use it only for content you trust. It exists so HTML-aware profiles such as `markdown-in-html` can pass through preview and export intentionally instead of silently broadening the parsing surface for every document.

## Opinionated MdWrk Authoring Extras

MdWrk adds editor conveniences on top of portable Markdown. These tools write Markdown for you, but the saved document remains plain text.

### Toolbar Actions

The editor toolbar currently exposes direct authoring controls for:

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

The toolbar also includes editor, split, and preview view controls so formatting and rendered output stay close together while you write.

### Keyboard and Editing Behavior

MdWrk includes opinionated editing behaviors that speed up list-heavy writing:

- `Ctrl/Cmd+B` wraps the current selection in `**bold**`
- `Ctrl/Cmd+I` wraps the current selection in `_italic_`
- `Ctrl/Cmd+Shift+X` wraps the current selection in `~~strikethrough~~`
- `Ctrl/Cmd+Z` and `Ctrl/Cmd+Shift+Z` drive undo and redo
- `Tab` indents the current line or selection
- `Shift+Tab` outdents the current line or selection
- `Enter` inside a list item continues the list automatically
- `Enter` on an empty bullet, ordered, or task-list item terminates that list item cleanly

### Table Builder

MdWrk includes an opinionated table insertion control in the editor toolbar. It helps generate table scaffolding quickly instead of requiring you to hand-type the initial pipe layout.

After insertion, the table remains ordinary Markdown:

```markdown
| Column A | Column B |
| :--- | :--- |
| Value | Value |
```

### Structured Inserts

Some current toolbar actions intentionally scaffold a known Markdown pattern instead of leaving the exact syntax to memory:

- footnote insertion adds a `[^1]` style reference marker
- inline math wraps the selection in `$...$`
- superscript wraps the selection in `^...^`
- subscript wraps the selection in `~...~`

These are authoring conveniences, not a separate file format.

## Practical Portability Guidance

Use the default CommonMark plus GFM surface when the same file needs to render well in MdWrk, GitHub, npm documentation, and other static Markdown tooling.

Enable optional profiles only when the document actually needs them. This keeps the source more portable and reduces surprises when the file moves into another renderer.

## Related Docs

- [Editor Basics](/docs/usage/editor-basics)
- [Rendering And Preview](/docs/usage/rendering-and-preview)
- [Client Configuration](/docs/getting-started/configuration)
