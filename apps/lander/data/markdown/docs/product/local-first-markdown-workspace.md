---
title: Local-First Markdown Workspace
slug: product/local-first-markdown-workspace
section: Product
sectionOrder: 2
order: 11
toc: true
date: 2026-05-03
status: published
excerpt: MdWrk is a local-first Markdown workspace for projects, folders, files, preview links, themes, and extensions that should remain usable without forcing a cloud document model.
relatedApis: @mdwrk/mdwrkspace, @mdwrk/extension-workspace-files, @mdwrk/extension-git-ops
---

MdWrk treats Markdown as a workspace, not a single textarea.

## Workspace Shape

The client presents projects, files, folders, editor panes, preview panes, settings, and extension surfaces inside one shell. Browser-managed storage is the default persistence layer, and desktop-backed file workflows can add host filesystem behavior where the shell supports it.

## Project Operations

Workspace operations include creating, renaming, deleting, and switching Markdown entries. Preview links can resolve against the current workspace so document sets can behave like connected knowledge and documentation projects.

## Extension Surface

Extensions can add managed views and commands without replacing the local-first editing model. Workspace Files and Git Operations are examples of package-ready surfaces for file-aware and repository-aware workflows.

## Related Docs

- [/docs/getting-started/local-setup](/docs/getting-started/local-setup)
- [/docs/extensions/extension-platform](/docs/extensions/extension-platform)
- [/docs/github-sync](/docs/github-sync)
