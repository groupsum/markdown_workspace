# Text Wrap Previewer

Text wrap previewer documents how MdWrk keeps source wrapping, preview wrapping, and line-number rhythm readable across pane sizes.

## What Text Wrap Previewer Covers

The text wrap previewer is the user-facing contract for readable long-form Markdown. It covers how source text wraps in the editor, how rendered Markdown wraps in preview, and how line numbers stay aligned when long source lines occupy multiple visual rows.

## Source Editor Wrapping

The source editor uses soft wrapping so files remain portable and line endings are not rewritten just to fit the pane. The editor estimates visual rows from the active text width and keeps the line-number gutter aligned with wrapped rows.

## Preview Wrapping

The preview pane uses the shared Markdown typography styles from the UI token layer. Paragraphs, code-adjacent prose, tables, and task lists should remain readable without forcing horizontal page scroll for normal prose.

## Split View Behavior

In split view, source and preview wrapping respond to the available pane width. The divider can change the wrapping context without changing the saved Markdown content.

## Practical Use

Use text wrap previewing when writing:

- long documentation pages
- checklist-heavy release notes
- narrow portrait-mode drafts
- split-pane review notes
- Markdown intended for static publishing

## Related Docs

- [Editor Basics](/features/editor-basics)
- [Rendering And Preview](/features/rendering-and-preview)
- [UIX Responsive Contract](/features/uix-responsive-contract/)

## Frequently Asked Questions

### What will I learn from Text Wrap Previewer?

Text wrap previewer documents how MdWrk keeps source wrapping, preview wrapping, and line-number rhythm readable across pane sizes.

### Who should read Text Wrap Previewer?

Read this page if you need practical MdWrk guidance for text wrap previewer, including the relevant workflow, product surface, and follow-up documentation paths.
