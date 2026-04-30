---
title: mdwrk Editor Basics
slug: usage/editor-basics
section: Product
sectionOrder: 2
order: 1
toc: true
---

The mdwrk client blends `@mdwrk/markdown-editor-react` with `@mdwrk/markdown-renderer-react`. The same split surface is what this lander demo now uses.

## Workspace Model
Documents live in browser-managed local storage unless you explicitly connect an integration. This keeps drafting private by default and lets the editor keep working when network access is unavailable.

## Views
Mdwrk supports the common writing surfaces expected from a Markdown workspace:

- editor-only writing
- rendered preview
- split editing and preview

Use the view that matches the task: focused drafting, review, or side-by-side editing.

## File Operations
Use workspace actions for document organization:

- create files and folders
- rename entries
- delete obsolete content
- switch between project workspaces

These operations are local-first. Sync or export intentionally when content needs to leave the browser.

## Editor Package Surface
The reusable editor package provides:

- controlled and uncontrolled editing modes
- keyboard shortcut and command wiring
- line-number gutter support
- theme bridge helpers for shared token-driven styling

## Themes and Responsive Layout
Themes follow the shared viewport contract across portrait, square, landscape, wide, and ultra-wide layouts. Each theme can style the bands differently while keeping the breakpoint behavior predictable.
