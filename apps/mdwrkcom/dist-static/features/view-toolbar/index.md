# View Toolbar

View toolbar documents the MdWrk controls for switching editor, split, and preview modes while keeping export and formatting actions discoverable.

## Toolbar Purpose

The view toolbar gives writers direct control over the active document surface. It keeps source editing, split preview, preview-only review, formatting commands, export actions, and table insertion close to the document.

## View Modes

MdWrk supports three primary document modes:

- editor
- split
- preview

Switching modes changes the visible panes without changing the Markdown document.

## Authoring Actions

The toolbar exposes common Markdown commands for formatting and document structure. These actions write Markdown syntax through the editor command model, which keeps the file portable.

Common commands include bold, italic, strikethrough, bullet list, task list, indent, outdent, inline math, footnote, superscript, subscript, undo, redo, and table insertion.

## Export Actions

The toolbar also provides Markdown export, HTML export, and print preview entry points. Export behavior uses the active document and current preview policy rather than a separate document model.

## Responsive Behavior

The toolbar must remain usable in narrow and portrait contexts. Controls can scroll or condense, but they should not cover the editor, preview, or modal content.

## Related Docs

- [Editor Basics](/features/editor-basics)
- [Text Wrap Previewer](/features/text-wrap-previewer/)
- [UIX Responsive Contract](/features/uix-responsive-contract/)

## Frequently Asked Questions

### What will I learn from View Toolbar?

View toolbar documents the MdWrk controls for switching editor, split, and preview modes while keeping export and formatting actions discoverable.

### Who should read View Toolbar?

Read this page if you need practical MdWrk guidance for view toolbar, including the relevant workflow, product surface, and follow-up documentation paths.
