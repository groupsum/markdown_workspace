---
title: Rendering and Preview
slug: usage/rendering-and-preview
section: Product
sectionOrder: 2
order: 3
toc: true
date: 2026-05-03
status: published
excerpt: MdWrk turns Markdown into a live rendered preview with internal-link navigation, profile-aware HTML handling, policy advisories, and export paths that stay aligned with the on-screen renderer.
---
## Quick Reference

Use this article to understand Rendering and Preview in the MdWrk Product surface. MdWrk turns Markdown into a live rendered preview with internal-link navigation, profile-aware HTML handling, policy advisories, and export paths that stay aligned with the on-screen renderer.

Key concepts covered here:

- live preview
- workspace organization
- theme portability

Useful follow-up pages:

- [Local-First Markdown Workspace](/docs/product/local-first-markdown-workspace)
- [Markdown Preview Editor](/docs/product/markdown-preview-editor)
- [Editor Basics](/docs/usage/editor-basics)

Use this page when you want the current MdWrk rendering contract across preview, navigation, HTML export, and print-oriented output.

## Live Preview Surface

MdWrk renders Markdown live inside the workspace so you can validate structure, spacing, tables, code blocks, task lists, and links while you write.

The preview surface is available in:

- split view beside the editor
- preview-only mode for reading and review
- export and print-oriented output flows
- lander documentation pages that reuse the same renderer family

## Shared Renderer Contract

MdWrk uses `@mdwrk/markdown-renderer-react` on top of `@mdwrk/markdown-renderer-core`. The renderer converts Markdown into semantic HTML and keeps the same baseline formatting contract across product surfaces.

That shared contract includes:

- headings and heading extraction
- paragraphs and inline emphasis
- links and images
- blockquotes
- ordered, unordered, and task lists
- tables
- fenced code blocks
- optional profile features such as footnotes, math, superscript, and subscript when enabled

## Internal Markdown Navigation

The workspace preview is not a dead render.

Internal Markdown links can resolve against the current workspace file set. That means preview links can:

- jump to a heading in the current document
- navigate to another Markdown file in the same workspace
- carry a pending hash so the destination preview scrolls to the intended section

This makes larger doc sets and linked note collections much easier to review without leaving the preview surface.

## Preview Policy and HTML Handling

Preview behavior is profile-aware.

MdWrk resolves HTML handling separately for preview and export so the product can show a clear policy instead of silently widening the trust boundary.

The current HTML handling modes are:

- `escape`
- `sanitize`
- `allow-trusted`

When preview policy warnings are relevant, the preview surface can show an advisory panel that summarizes the current HTML handling mode and any active profile warnings.

## Optional Profiles in Preview

The renderer respects the workspace Markdown profile configuration. That means the preview surface can reflect:

- footnotes
- definition lists
- math structures
- superscript
- subscript
- smart punctuation
- experimental profiles such as citations or markdown-in-html when explicitly enabled

This keeps preview behavior aligned with the configured document contract instead of guessing.

## Preview Actions

The workspace preview can expose direct output actions without leaving the rendered surface:

- HTML export
- print preview

These actions are available as overlay controls on the preview pane when the surrounding shell wires them in.

## HTML Export Alignment

MdWrk's HTML export is generated from the same rendering pipeline used for preview. That matters because the exported document is meant to look and behave like the preview you already approved.

The export flow currently includes:

- the active Markdown profile configuration
- profile-aware HTML handling
- advisory messaging when preview/export policy matters
- theme-aware styling
- configurable background mode
- print-oriented page styling

This keeps export from becoming a separate undocumented renderer with different results.

## Print and PDF-Oriented Output

MdWrk's export styles include print-specific controls for page shape and long-form document behavior.

Current output rules include:

- A4 portrait or landscape orientation
- explicit page margins
- print font size and line-height tokens
- heading keep-with-next behavior
- page-break helper hooks for Markdown-rendered content

These controls make the rendered output more useful for documentation reviews, handoffs, and printable deliverables.

## Theme-Aware Rendering

Preview and export styling are theme-aware. MdWrk bridges shared tokens into the renderer so Markdown surfaces inherit the active workspace language instead of feeling visually detached from the rest of the product.

That includes:

- foreground and muted text colors
- code block colors
- table header and row styling
- blockquote treatment
- print/export background choices

## Why This Matters

MdWrk treats rendering as a first-class product surface, not as a best-effort convenience after editing. The preview is where document structure, links, and export readiness become visible, so it needs to stay trustworthy and aligned with the actual file.

## Related Docs

- [Editor Basics](/docs/usage/editor-basics)
- [Advanced Markdown Formatting](/docs/usage/advanced-formatting)
- [Client Configuration](/docs/getting-started/configuration)
