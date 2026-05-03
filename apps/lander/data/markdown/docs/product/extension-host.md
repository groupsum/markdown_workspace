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

The MdWrk client is the extension host for bundled and installable extension surfaces.

## Host Contract

The host exposes stable lifecycle and context contracts through extension packages. Extensions register commands, views, settings, and contributions through governed adapters instead of patching the client directly.

## Runtime Controls

The runtime handles activation, compatibility, persisted state, diagnostics, and trust policy enforcement. The manager extension gives users a visible operator console for installed extension behavior.

## First-Party Extensions

Current bundled surfaces include Extension Manager, Theme Studio, Language Pack Studio, Gemini Agent, Workspace Files, Git Operations, and catalog examples.

## Related Docs

- [/docs/extensions/extension-platform](/docs/extensions/extension-platform)
- [/docs/authoring/extensions](/docs/authoring/extensions)
- [/docs/product/theme-packs](/docs/product/theme-packs)
