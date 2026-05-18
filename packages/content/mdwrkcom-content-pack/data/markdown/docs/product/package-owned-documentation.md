---
title: Package-Owned Documentation
slug: product/package-owned-documentation
section: Features
sectionOrder: 2
order: 19
toc: true
date: 2026-05-18
status: published
author: CobyCloud
displayAuthor: false
excerpt: Package-owned documentation explains how MdWrk change requests stay attached to the package or package set that owns the runtime behavior.
---

## Ownership Model

MdWrk change requests are documented by the package owner or explicit package set that owns the behavior. App-host work must name the app package and every reusable package that the app consumes.

The documentation owner should match the implementation owner:

- app host behavior belongs to `apps/client`, `apps/desktop`, or `apps/mdwrkcom`
- reusable editor behavior belongs to `@mdwrk/markdown-editor-core`, `@mdwrk/markdown-editor-react`, or `@mdwrk/markdown-edit-in-renderer-react`
- extension contracts belong to `@mdwrk/extension-manifest`, `@mdwrk/extension-host`, and `@mdwrk/extension-runtime`
- lander content belongs to `@mdwrk/mdwrkcom-content-pack`
- portable lander rendering, SEO, and theme behavior belongs to the lander package family

## Change Request Trace

Each durable documentation change should identify the feature, the owning package, the affected docs page, the executable validation, and the evidence artifact. A package-changing change request also needs the affected package version bumped by patch or minor.

Documentation does not replace runtime tests. It records the package boundary and points to the behavior that the test suite verifies.

## Related Docs

- [Extension Authoring Guide](/docs/authoring/extension-authoring-guide/)
- [Editor Command Integrity](/features/editor-command-integrity/)
- [Screenshot Evidence](/features/screenshot-evidence/)
