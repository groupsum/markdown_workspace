---
title: Client Installation
slug: getting-started/installation
section: Getting Started
sectionOrder: 1
order: 1
toc: true
date: 2026-05-02
status: published
excerpt: Use the browser route for immediate access, the PWA route for an installable shell, local setup for development control, or standalone modules for package-level adoption.
---

## Installation Paths

- [Use in a browser](/docs/getting-started/browser-use) when you want the fastest way to start writing without installing anything.
- [Install as a PWA](/docs/getting-started/pwa-installation) when you want an app-like shell with browser-managed updates.
- [Run locally from the repo or a local build](/docs/getting-started/local-setup) when you need a local development or self-hosted workflow.
- [Use standalone modules](/docs/getting-started/standalone-modules) when you only want the reusable client, editor, or renderer packages.

## Quick Choice Guide

Use the browser route if you want immediate access with no setup.
Use the PWA route if you want a dedicated window and installable shell.
Use the local route if you need development control, local hosting, or a private self-managed deployment.
Use standalone modules if you are embedding MdWrk surfaces into another product or internal tool.

## Workspace Client Package

The publishable client package is:

```text
@mdwrk/mdwrkspace
```

The split reusable packages start with:

```text
@mdwrk/markdown-editor-react
@mdwrk/markdown-renderer-react
@mdwrk/markdown-renderer-core
```

For package discovery and published versions, use the organization page:

```text
https://www.npmjs.com/org/mdwrk
```

## Notes

Bundled extensions ship with the client build. External installable extensions follow the signed-manifest and trust-policy path documented in the extension docs.
Published dates and statuses control whether installation docs appear on the lander at all, so draft installation notes can stay private until they are ready.

## Quick Reference

Use this article to understand Client Installation in the MdWrk Getting Started surface. Client Installation explains how this MdWrk surface works in the current client and package system.

Key concepts covered here:

- local Markdown files
- workspace organization
- extension host contracts
- developer package reuse

Useful follow-up pages:

- [Local-First Markdown Workspace](/docs/product/local-first-markdown-workspace)
- [Editor Basics](/docs/usage/editor-basics)
- [Extension Platform](/docs/extensions/extension-platform)

`mdwrk` is the client and package surface. The lander is only the documentation and release site.

Choose the workflow that matches how you want to consume the workspace or packages.
