---
title: PWA Install, Zoom Controls, and Preview Refinements Make MdWrk Ready for Daily Use
date: 2026-01-22
status: published
author: CobyCloud
excerpt: MdWrk gains PWA install support, zoom controls, preview refinements, and deployment rails that turn the workspace into a stronger everyday writing environment.
---

## What users gain

- installable browser app behavior
- clearer zoom scaling for long writing sessions
- stronger markdown table rendering in preview
- a more polished route from local development to hosted delivery

## Install path

Readers who want the current install flow can start here:

- [PWA installation](/docs/getting-started/pwa-installation)
- [Installation overview](/docs/getting-started/installation)

## Screenshot

![MdWrk theme selector and install-ready shell behavior](/blog/media/theme-selector-modal.jpg)

## Example deployment-oriented workflow

```bash
npm install --ignore-scripts
npm run build -w apps/client
```

That build flow feeds the installable client surface and supports teams that want a browser-first markdown experience with a product-grade feel.

## Repo history for deeper review

- [January 22 repository history](https://github.com/groupsum/markdown_workspace/commits/master/?since=2026-01-22T00:00:00Z&until=2026-01-23T00:00:00Z)

This date matters because it shows how MdWrk serves writers, operators, and deployers in one cohesive flow.

## Article Guide

2026-01-22 marks this MdWrk product story: MdWrk gains PWA install support, zoom controls, preview refinements, and deployment rails that turn the workspace into a stronger everyday writing environment.

This article is useful for readers tracking:

- how MdWrk changes affect daily Markdown writing
- which client, package, or extension surface the change touches
- where to continue in the product documentation after reading

Useful follow-up pages:

- [Local-First Markdown Workspace](/features/local-first-markdown-workspace)
- [Markdown Preview Editor](/features/markdown-preview-editor)
- [Theme Packs](/features/theme-packs)

January 22, 2026 moves MdWrk from an exciting workspace demo into an installable daily tool.

The repo history for that step includes:

- [Add PWA service worker and install controls](https://github.com/groupsum/markdown_workspace/commit/343925d0)
- [Fix zoom scaling for UI text and icons](https://github.com/groupsum/markdown_workspace/commit/b5486fcd)
- [implement deploy](https://github.com/groupsum/markdown_workspace/commit/2ea7e01b)
