---
title: Extension Host
slug: product/extension-host
section: Product
sectionOrder: 2
order: 15
toc: true
date: 2026-05-03
status: published
excerpt: MdWrk includes a governed extension host with manifest, runtime, capability, trust, settings, command, view, diagnostics, theme, and language-pack surfaces.
relatedApis: @mdwrk/extension-host, @mdwrk/extension-runtime, @mdwrk/extension-manifest, @mdwrk/extension-manager
---
## Quick Reference

Use this article to understand Extension Host in the MdWrk Product surface. MdWrk includes a governed extension host with manifest, runtime, capability, trust, settings, command, view, diagnostics, theme, and language-pack surfaces.

Key concepts covered here:

- workspace organization
- extension host contracts
- theme portability
- developer package reuse
- @mdwrk/extension-host

Useful follow-up pages:

- [Local-First Markdown Workspace](/docs/product/local-first-markdown-workspace)
- [Extension Platform](/docs/extensions/extension-platform)
- [Theme Packs](/docs/product/theme-packs)

The MdWrk client is the extension host for bundled and installable extension surfaces.

## Host Contract

The host exposes stable lifecycle and context contracts through extension packages. Extensions register commands, views, settings, and contributions through governed adapters instead of patching the client directly.

## Runtime Controls

The runtime handles activation, compatibility, persisted state, diagnostics, and trust policy enforcement. The manager extension gives users a visible operator console for installed extension behavior.

## First-Party Extensions

Current bundled surfaces include Extension Manager, Theme Studio, Language Pack Studio, Gemini Agent, Workspace Files, Git Operations, and catalog examples.

## Related Docs

- [Extension Platform](/docs/extensions/extension-platform)
- [Extension Authoring](/docs/authoring/extensions)
- [Theme Packs](/docs/product/theme-packs)
