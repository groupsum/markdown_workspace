---
title: Governed Releases, CI Evidence, and Package Docs Give MdWrk a Stronger Public Shape
date: 2026-03-31
status: published
author: CobyCloud
excerpt: MdWrk expands its release and documentation surface with package evidence, governance checks, and public docs that help teams understand package scope, delivery, and verification commands.
---

## What this adds

This update brings together the details teams usually need first:

- How does the workspace verify package quality?
- Which docs stay current?
- Which commands carry release verification?

MdWrk now answers those questions through docs and executable CI rails.

## Commands that express the release story

```bash
npm run ci:workspace:verify
npm run conformance
```

## Docs to read next

- [Installation](/docs/getting-started/installation)
- [Local setup](/docs/getting-started/local-setup)
- [Extension platform](/docs/extensions/extension-platform)

## Screenshot

![MdWrk docs and product presentation aligned for package usage](/blog/media/lander-docs-dark.png)

## Why this post matters

March 31 is where MdWrk gives teams a clearer view of:

- package verification
- release commands
- current docs
- package boundaries

It is a major point on the timeline because package usage, release checks, and public docs start moving together.

## Article Guide

2026-03-31 marks this MdWrk product story: MdWrk expands its release and documentation surface with package evidence, governance checks, and public docs that help teams understand package scope, delivery, and verification commands.

This article is useful for readers tracking:

- how MdWrk changes affect daily Markdown writing
- which client, package, or extension surface the change touches
- where to continue in the product documentation after reading

Useful follow-up pages:

- [Local-First Markdown Workspace](/docs/product/local-first-markdown-workspace)
- [Extension Platform](/docs/extensions/extension-platform)
- [GitHub Sync](/docs/github-sync)

March 31, 2026 brings together docs, governance, and release evidence in a way that gives MdWrk a clearer package and release surface.

This milestone is grounded in:

- [Add governance specs, CI checks, and documentation overhaul](https://github.com/groupsum/markdown_workspace/commit/3cb1ef10)
- [Add markdown profile claim gate, tests, and CI evidence](https://github.com/groupsum/markdown_workspace/commit/1e511548)
- [Align extension manifests and artifacts to 1.1.0](https://github.com/groupsum/markdown_workspace/commit/93ea12ef)
