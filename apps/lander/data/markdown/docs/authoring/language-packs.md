---
title: Language Pack Authoring
slug: authoring/language-packs
section: Authoring
sectionOrder: 3.5
order: 4
toc: true
date: 2026-05-02
status: published
---
## Quick Reference

Use this article to understand Language Pack Authoring in the MdWrk Authoring surface. Language Pack Authoring explains how this MdWrk surface works in the current client and package system.

Key concepts covered here:

- local Markdown files
- workspace organization
- privacy-first storage
- extension host contracts
- developer package reuse

Useful follow-up pages:

- [Local-First Markdown Workspace](/docs/product/local-first-markdown-workspace)
- [Extension Platform](/docs/extensions/extension-platform)
- [Client Installation](/docs/getting-started/installation)

Use this path when you want to author portable MdWrk language packs rather than only enable or disable built-in locales.

## Primary surface

Language pack authoring in this repository centers on the first-party studio package:

```text
packages/extensions/extension-language-pack-studio/
```

That surface is responsible for browsing, editing, importing, exporting, and activating language packs.

## Authoring expectations

A language-pack author should expect to work with:

- locale labels and message catalogs
- import and export flows
- built-in and installed pack visibility
- activation and deactivation behavior through the host settings/runtime surfaces

## What the studio proves

Language Pack Studio demonstrates that language-pack management is not just a static bundle concern.
It is a governed workspace surface with:

- authoring UI
- import validation
- export behavior
- persistence through the local host storage model

## Artifact model

Language packs should be portable artifacts that the host can inspect, import, and activate without requiring app-local rewrites.

The authoring flow should preserve:

- stable locale identity
- portable message payloads
- compatibility with the shared i18n surfaces

## Reference surfaces

Use these repo surfaces as the concrete reference:

```text
packages/extensions/extension-language-pack-studio/
packages/shared/i18n/
docs/conformance/extension-workspace-surfaces-claim.md
```
