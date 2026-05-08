---
title: GitHub Sync
slug: github-sync
section: Integrations
sectionOrder: 3
order: 1
toc: true
date: 2026-05-02
status: published
author: CobyCloud
excerpt: Repository Access Use a GitHub personal access token with the narrowest permissions your workflow requires. Store the token only when you want mdwrk to read from or write to a repository.
---

## Repository Access
Use a GitHub personal access token with the narrowest permissions your workflow requires. Store the token only when you want mdwrk to read from or write to a repository.

## Pull and Push
Typical sync flow:

1. Pull repository content into the local workspace.
2. Edit documents in mdwrk.
3. Review changes before pushing.
4. Push intentionally when the local draft is ready to leave the browser.

## Privacy Boundary
Mdwrk does not need a backend server for normal editing. Content stays on the device unless you choose to sync, export, or otherwise send it somewhere else.

## Operational Notes
For production deployments, keep GitHub links current through `VITE_GITHUB_REPO_URL`. The public lander currently points to:

```text
https://github.com/groupsum/mdwrk
```

## Quick Reference

Use this article to understand GitHub Sync in the MdWrk Integrations surface. GitHub Sync explains how this MdWrk surface works in the current client and package system.

Key concepts covered here:

- local Markdown files
- workspace organization
- developer package reuse

Useful follow-up pages:

- [Privacy-First Markdown Editor](/features/privacy-first-markdown-editor)
- [Local-First Markdown Workspace](/features/local-first-markdown-workspace)
- [GitHub Sync](/docs/github-sync)

GitHub sync is optional. The MdWrk client stays fully local until you connect a repository.
