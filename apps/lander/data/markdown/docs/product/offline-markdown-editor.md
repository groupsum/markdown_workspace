---
title: Offline Markdown Editor
slug: product/offline-markdown-editor
section: Product
sectionOrder: 2
order: 10
toc: true
date: 2026-05-03
status: published
excerpt: MdWrk is an offline-capable Markdown editor that keeps writing, preview, workspace state, and installable app behavior available on the device after the client assets are loaded.
relatedApis: @mdwrk/mdwrkspace, @mdwrk/markdown-editor-react, @mdwrk/markdown-renderer-react
---

MdWrk gives Markdown authors a browser-first editor that continues to work when the network is unavailable.

## Offline Editing Model

The workspace stores documents in browser-managed local storage and IndexedDB-backed client state. The PWA install path can keep the client available in a dedicated app window while the editor keeps source text and preview close together.

## Writing Workflow

Use the editor-only view for focused drafting, split view for live validation, and preview-only mode for review. Formatting commands write portable Markdown instead of proprietary document state.

## Local Storage Boundary

MdWrk does not require documents to be uploaded to a hosted service before editing. Sync and export are intentional workflows, not hidden defaults.

## Related Docs

- [/docs/getting-started/browser-use](/docs/getting-started/browser-use)
- [/docs/getting-started/pwa-installation](/docs/getting-started/pwa-installation)
- [/docs/usage/editor-basics](/docs/usage/editor-basics)
