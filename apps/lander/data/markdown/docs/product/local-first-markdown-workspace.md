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

## Workspace Shape

The client presents projects, files, folders, editor panes, preview panes, settings, and extension surfaces inside one shell. Browser-managed storage is the default persistence layer, and desktop-backed file workflows can add host filesystem behavior where the shell supports it.

## Project Operations

Workspace operations include creating, renaming, deleting, and switching Markdown entries. Preview links can resolve against the current workspace so document sets can behave like connected knowledge and documentation projects.

## Extension Surface

Extensions can add managed views and commands without replacing the local-first editing model. Workspace Files and Git Operations are examples of package-ready surfaces for file-aware and repository-aware workflows.

## Related Docs

- [Local Setup](/docs/getting-started/local-setup)
- [Extension Platform](/docs/extensions/extension-platform)
- [GitHub Sync](/docs/github-sync)

## Quick Reference

Use this article to understand Local-First Markdown Workspace in the MdWrk Product surface. MdWrk is a local-first Markdown workspace for projects, folders, files, preview links, themes, and extensions that should remain usable without forcing a cloud document model.

Key concepts covered here:

- local Markdown files
- live preview
- workspace organization
- privacy-first storage
- extension host contracts

Useful follow-up pages:

- [Local-First Markdown Workspace](/docs/product/local-first-markdown-workspace)
- [Markdown Preview Editor](/docs/product/markdown-preview-editor)
- [Editor Basics](/docs/usage/editor-basics)

MdWrk treats Markdown as a workspace, not a single textarea.
