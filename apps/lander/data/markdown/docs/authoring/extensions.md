---
title: Extension Authoring
slug: authoring/extensions
section: Authoring
sectionOrder: 3.5
order: 2
toc: true
date: 2026-05-02
status: published
---

## What an extension author owns

The extension authoring surface in this repository is split across:

- `@mdwrk/extension-manifest` for manifest shape and metadata
- `@mdwrk/extension-host` for host-safe APIs
- `@mdwrk/extension-runtime` for activation and lifecycle expectations
- package-local source, tests, and build outputs inside an extension package

## Typical workflow

1. Create a normal npm package for the extension source.
2. Export a valid MdWrk extension manifest and lifecycle entrypoint.
3. Test the manifest, lifecycle, and runtime-facing behavior.
4. Publish the source package for developer consumption when appropriate.
5. Generate browser-installable artifacts through the formal distribution flow when targeting external installation.

## Required package shape

At minimum, an extension package should include:

- `package.json`
- `README.md`
- `src/manifest.ts`
- `src/index.ts`
- tests for manifest, lifecycle, and runtime behavior

## Runtime and distribution rules

External extensions do not install through ad hoc `npm install` inside the browser.
The browser host installs generated artifacts with manifest, integrity, compatibility, and signer metadata.

That means an extension author should expect:

- trust-policy enforcement
- capability gating
- compatibility declarations
- signed/installable artifact generation for the external path

## Reference package

This repository already includes a reference external package:

```text
packages/extensions/extension-catalog-hello/
```

Use it as the concrete reference for:

- manifest structure
- distribution metadata
- runtime install expectations
- certification preparation

## Related documents

For the deeper operator workflow, see:

```text
docs/operations/third-party-extension-authoring.md
docs/architecture/extension-package-layout.md
```

## Quick Reference

Use this article to understand Extension Authoring in the MdWrk Authoring surface. Extension Authoring explains how this MdWrk surface works in the current client and package system.

Key concepts covered here:

- local Markdown files
- extension host contracts
- developer package reuse

Useful follow-up pages:

- [Local-First Markdown Workspace](/docs/product/local-first-markdown-workspace)
- [Extension Platform](/docs/extensions/extension-platform)
- [Developer Documentation](/docs/product/developer-documentation)

Use this path when you want to author an MdWrk extension package rather than only install or operate one.
