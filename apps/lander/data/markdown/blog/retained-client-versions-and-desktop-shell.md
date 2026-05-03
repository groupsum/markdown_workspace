---
title: Retained Client Versions and the Desktop Shell Expanded How Teams Can Deploy MdWrk
date: 2026-04-12
status: published
author: CobyCloud
excerpt: MdWrk introduced retained client version delivery and a desktop shell track, giving teams more control over rollout pacing, install shape, and long-lived workspace adoption.
---
April 12, 2026 broadened MdWrk's delivery model.

The timeline anchor includes:

- [Implement retained client version delivery and PWA switching](https://github.com/groupsum/markdown_workspace/commit/5942849c)
- [feat: +desktop](https://github.com/groupsum/markdown_workspace/commit/cba6ac9c)
- [Bump all package versions and hash app build IDs](https://github.com/groupsum/markdown_workspace/commit/c13aba8c)

## What this means for teams

Teams can now plan around:

- browser delivery with retained client versions
- installable desktop packaging
- stronger release identity through versioned build outputs

## Usage references

- [Installation](/docs/getting-started/installation)
- [Local setup](/docs/getting-started/local-setup)

## Build example

```bash
npm run build:client
npm run build:desktop
```

## Screenshot

![MdWrk home surface that introduces the packaged client experience](/blog/media/lander-home-light.png)

## Why this milestone matters

Deployment flexibility matters for teams that want browser-first use, desktop packaging, or self-managed hosting. April 12 shows MdWrk growing into a platform that can support all three with one codebase.
