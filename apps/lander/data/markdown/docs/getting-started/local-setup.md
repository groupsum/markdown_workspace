---
title: Local Setup
slug: getting-started/local-setup
section: Getting Started
sectionOrder: 1
order: 4
toc: true
date: 2026-05-02
status: published
excerpt: This path is for maintainers, internal adopters, and self-hosting operators who want more control than the browser or PWA flows provide.
---

## What it covers

This path is for maintainers, internal adopters, and self-hosting operators who want more control than the browser or PWA flows provide.

## Workspace prerequisites

- Node.js `>=20 <23`
- npm `>=10`
- a local checkout of the repository

## Basic local workflow

1. Clone the repository.
2. Install workspace dependencies.
3. Start the surface you want to work on.

```bash
git clone https://github.com/groupsum/markdown_workspace.git
cd markdown_workspace
npm install --ignore-scripts
```

## Common local commands

Run the client during development:

```bash
npm run dev:client
```

Run the lander during development:

```bash
npm run dev:lander
```

Build the client:

```bash
npm run build -w apps/client
```

Build the lander:

```bash
npm run build -w apps/lander
```

## Self-hosting notes

The lander is a static site build. Set `VITE_SITE_URL` at build time so `robots.txt` and `sitemap.xml` use the correct public origin.

```bash
VITE_SITE_URL=https://mdwrk.com npm run build -w apps/lander
```

The public lander is intended to sit behind a reverse proxy. Docker Compose in this repository must keep services internal-only rather than exposing ports directly.

## When to choose another path

Choose browser use or the PWA route when you just want to write.
Choose standalone modules when you want package reuse without running the whole repository workspace.

## Quick Reference

Use this article to understand Local Setup in the MdWrk Getting Started surface. Local Setup explains how this MdWrk surface works in the current client and package system.

Key concepts covered here:

- local Markdown files
- workspace organization
- extension host contracts
- developer package reuse

Useful follow-up pages:

- [Local-First Markdown Workspace](/docs/product/local-first-markdown-workspace)
- [GitHub Sync](/docs/github-sync)
- [PWA Installation](/docs/getting-started/pwa-installation)

Use local setup when you want to run MdWrk from a repository checkout, create your own builds, or host the public surfaces yourself.
