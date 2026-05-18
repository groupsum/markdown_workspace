---
title: Editor Command Integrity
slug: usage/editor-command-integrity
section: Features
sectionOrder: 2
order: 9
toc: true
date: 2026-05-18
status: published
author: CobyCloud
displayAuthor: false
excerpt: Editor command integrity documents how MdWrk toolbar actions preserve focus, selection, and isolated Markdown transforms.
---

## Command Boundary

MdWrk editor controls dispatch package commands through the editor package surface. Toolbar buttons should not apply ad hoc DOM mutations or React-only text changes.

The core command boundary is split across:

- `@mdwrk/markdown-editor-core` for transforms
- `@mdwrk/markdown-editor-react` for command dispatch and focus handoff
- `@mdwrk/markdown-edit-in-renderer-react` for rendered-flow editing parity

## Focus And Selection

Checkbox insertion creates only the checkbox marker, keeps focus in the editor, and places the cursor after one whitespace. Link and image commands are separate transforms, so applying a link must not rewrite existing image syntax and applying an image must not behave like an ordinary link.

Italic, underline, task-list, list, indentation, link, and image commands need separate tests when their behavior changes.

## Related Docs

- [View Toolbar](/features/view-toolbar/)
- [Text Wrap Previewer](/features/text-wrap-previewer/)
- [Package-Owned Documentation](/features/package-owned-documentation/)
