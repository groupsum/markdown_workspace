---
title: Standalone Modules
slug: getting-started/standalone-modules
section: Getting Started
sectionOrder: 1
order: 5
toc: true
date: 2026-05-02
status: published
---

## Primary packages

The main package surfaces are:

- `@mdwrk/mdwrkspace` for the full reusable workspace client
- `@mdwrk/markdown-editor-react` for the editor surface
- `@mdwrk/markdown-renderer-react` for the React renderer surface
- `@mdwrk/markdown-renderer-core` for core parsing and rendering utilities

## Full client package

Install the reusable client package when you want the packaged workspace surface:

```bash
npm install @mdwrk/mdwrkspace
```

## Split editor and renderer packages

Install the split packages when you only need one part of the experience:

```bash
npm install @mdwrk/markdown-editor-react @mdwrk/markdown-renderer-react
```

The editor React package depends on the editor core package internally.
The renderer React package depends on the renderer core package internally.

## ESM CDN example

Load the published client directly from an ESM CDN:

```html
<div id="mdwrkspace-root"></div>
<script type="module">
  import { mountMdWrkSpace } from "https://esm.sh/@mdwrk/mdwrkspace";

  const root = document.getElementById("mdwrkspace-root");
  mountMdWrkSpace(root);
</script>
```

## Package selection guidance

Choose `@mdwrk/mdwrkspace` when you want the packaged workspace entrypoint.
Choose `@mdwrk/markdown-editor-react` when authoring is the primary concern.
Choose `@mdwrk/markdown-renderer-react` when rendering is the primary concern.
Choose `@mdwrk/markdown-renderer-core` when you need lower-level parsing and HTML rendering utilities.

## Related guidance

For package-level configuration details, see the client configuration docs.
For published package discovery, use:

```text
https://www.npmjs.com/org/mdwrk
```

## Quick Reference

Use this article to understand Standalone Modules in the MdWrk Getting Started surface. Standalone Modules explains how this MdWrk surface works in the current client and package system.

Key concepts covered here:

- workspace organization
- developer package reuse

Useful follow-up pages:

- [Local-First Markdown Workspace](/docs/product/local-first-markdown-workspace)
- [Editor Basics](/docs/usage/editor-basics)
- [Client Installation](/docs/getting-started/installation)

Use standalone modules when you want MdWrk surfaces inside another application rather than the full workspace shell.
