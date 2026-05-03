---
title: Extension Compatibility Gates Turned MdWrk Publishing into a Clear Quality Signal
date: 2026-04-01
status: published
author: CobyCloud
excerpt: MdWrk sharpened extension compatibility checks, persistence flows, and publish gates, helping teams ship installable extensions with stronger confidence and cleaner runtime expectations.
---
April 1, 2026 tightened the extension delivery story with compatibility gates, version alignment, and publish-focused verification.

The milestone sits on these commits:

- [Enforce test gate before package publish](https://github.com/groupsum/markdown_workspace/commit/9c3e88c5)
- [Fix extension compatibility checks and editor overflow defaults](https://github.com/groupsum/markdown_workspace/commit/8f2cc526)
- [Update extension modals, persistence, and workspace version matrix](https://github.com/groupsum/markdown_workspace/commit/a4aaec70)

## Why this matters for extension teams

A governed extension platform sells better when it communicates:

- the host version it supports
- the tests that protect installation and runtime
- the UX where users manage extensions and settings

## Example compatibility-focused workflow

```bash
npm run test -w @mdwrk/extension-runtime
npm run test -w @mdwrk/extension-manager
npm run validate:compatibility
```

## Screenshot

![MdWrk settings and extension-related configuration surfaces](/blog/media/mdwrk-settings-visual.png)

## What to read next

- [Extension platform](/docs/extensions/extension-platform)
- [Extension authoring](/docs/authoring/extensions)
- [April 1 repository history](https://github.com/groupsum/markdown_workspace/commits/master/?since=2026-04-01T00:00:00Z&until=2026-04-02T00:00:00Z)

This post marks the point where MdWrk’s extension system became easier to trust, easier to document, and easier to carry into release workflows.
