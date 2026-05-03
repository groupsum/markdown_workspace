---
title: Desktop Release Automation and Android Verification Sharpen MdWrk Cross-Platform Delivery
date: 2026-04-14
status: published
author: CobyCloud
excerpt: MdWrk refines desktop release automation, version-tag generation, and Android artifact verification, giving release teams a stronger cross-platform shipment story.
---

## Why this matters

This milestone gives teams a stronger answer to:

- how desktop builds move into release
- how Android artifacts are verified
- how version tags stay aligned with package state

## Commands that support the release path

```bash
npm run build:desktop:win
npm run ci:desktop:build
npm run ci:desktop:release
```

## Screenshot

![MdWrk settings and configuration surface that supports packaged client delivery](/blog/media/settings-github-configurations.jpg)

## Repo history links

- [April 14 repository history](https://github.com/groupsum/markdown_workspace/commits/master/?since=2026-04-14T00:00:00Z&until=2026-04-15T00:00:00Z)
- [Local setup docs](/docs/getting-started/local-setup)

This is the point where MdWrk starts communicating a stronger release operations story alongside its authoring story.

## Article Guide

2026-04-14 marks this MdWrk product story: MdWrk refines desktop release automation, version-tag generation, and Android artifact verification, giving release teams a stronger cross-platform shipment story.

This article is useful for readers tracking:

- how MdWrk changes affect daily Markdown writing
- which client, package, or extension surface the change touches
- where to continue in the product documentation after reading

Useful follow-up pages:

- [Local-First Markdown Workspace](/docs/product/local-first-markdown-workspace)
- [GitHub Sync](/docs/github-sync)
- [Local Setup](/docs/getting-started/local-setup)

April 14, 2026 marks one of the clearest release-engineering milestones in the repository history.

The day includes:

- [Auto-generate desktop release tag from package version](https://github.com/groupsum/markdown_workspace/commit/b94c4b46)
- [Narrow desktop release workflow to installable artifacts](https://github.com/groupsum/markdown_workspace/commit/177c25aa)
- [Fix release artifacts to include APK and exclude elevate.exe](https://github.com/groupsum/markdown_workspace/commit/edfe9135)
- [Fix Android APK CI verification for unsigned artifacts](https://github.com/groupsum/markdown_workspace/commit/dd84df6e)

It also lines up with published tags:

- `v0.2.34`
- `v0.2.35`
- `v0.2.38`
