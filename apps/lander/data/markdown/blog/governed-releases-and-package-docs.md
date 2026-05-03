---
title: Governed Releases, CI Evidence, and Package Docs Gave MdWrk a Stronger Public Shape
date: 2026-03-31
status: published
author: CobyCloud
excerpt: MdWrk expanded its release and documentation story with package evidence, governance checks, and public-facing docs that help teams evaluate quality, delivery, and package scope with confidence.
---
March 31, 2026 brought together docs, governance, and release evidence in a way that made MdWrk easier to evaluate as a serious package platform.

This milestone is grounded in:

- [Add governance specs, CI checks, and documentation overhaul](https://github.com/groupsum/markdown_workspace/commit/3cb1ef10)
- [Add markdown profile claim gate, tests, and CI evidence](https://github.com/groupsum/markdown_workspace/commit/1e511548)
- [Align extension manifests and artifacts to 1.1.0](https://github.com/groupsum/markdown_workspace/commit/93ea12ef)

## What technical buyers care about here

Technical buyers often ask:

- How does the workspace verify package quality?
- Which docs stay current?
- Which commands carry release verification?

MdWrk now answers those questions through docs and executable CI rails.

## Commands that express the release story

```bash
npm run ci:workspace:verify
npm run conformance
```

## Golden docs to read next

- [Installation](/docs/getting-started/installation)
- [Local setup](/docs/getting-started/local-setup)
- [Extension platform](/docs/extensions/extension-platform)

## Screenshot

![MdWrk docs and product presentation aligned for package evaluation](/blog/media/lander-docs-dark.png)

## Why this post matters

March 31 is where MdWrk became easier to explain to:

- platform teams
- package consumers
- release managers
- engineering leaders looking for verifiable delivery rails

It is a major point on the timeline because the product story and the operational story started moving together.
