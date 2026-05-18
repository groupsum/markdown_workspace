---
title: Theme Studio and Host Surfaces
slug: extensions/theme-studio-and-host-surfaces
section: Extensions
sectionOrder: 4
order: 2
toc: true
date: 2026-02-05
status: published
author: CobyCloud
excerpt: Theme Studio demonstrates how first-party extensions use host surfaces, theme contracts, workspace panes, and export flows inside the MdWrk extension model.
---

## Theme Studio

Theme Studio is the first-party extension surface for:

- inspecting formal theme tokens
- previewing token changes against editor and preview bridges
- applying and reverting draft theme changes
- exporting theme artifacts for host, renderer, or editor targets

## Shared contract

Theme compatibility is governed through `@mdwrk/theme-contract`. That contract allows:

- client built-in themes
- extension-authored themes
- renderer and editor bridge variables
- exportable CSS and preset payloads

## Why this matters

The lander now uses the same editor and renderer package family with lander light and dark themes, instead of documenting itself as if it were the main product.

## Quick Reference

Use this article to understand Theme Studio And Host Surfaces in the MdWrk Extensions surface. Theme Studio connects theme authoring, shared token contracts, editor previews, renderer previews, and extension-host delivery.

Key concepts covered here:

- theme portability
- extension host contracts
- live preview
- `@mdwrk/theme-contract`
- `@mdwrk/extension-theme-studio`

Useful follow-up pages:

- [Theme Packs](/features/theme-packs)
- [Theme Pack Authoring](/docs/authoring/theme-packs)
- [Extension Platform](/docs/extensions/extension-platform)

The theme story is shared across the client, editor, renderer, and extension host.
