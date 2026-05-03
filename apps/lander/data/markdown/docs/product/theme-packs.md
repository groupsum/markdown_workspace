---
title: Theme Packs
slug: product/theme-packs
section: Product
sectionOrder: 2
order: 16
toc: true
date: 2026-05-03
status: published
excerpt: MdWrk theme packs use a shared token and class-name contract so editor, renderer, extension, and workspace surfaces can be styled without private app selectors.
relatedApis: @mdwrk/theme-contract, @mdwrk/extension-theme-studio, @mdwrk/ui-tokens
---

## Theme Contract

Theme packs target shared tokens, bridge variables, and class names. This keeps theme behavior portable across the editor, renderer, host, and extension views.

## Theme Studio

The Theme Studio extension provides a first-party authoring workflow for inspecting tokens, previewing editor and renderer changes, applying draft values, reverting them, and exporting theme artifacts.

## Viewport Contract

Viewport and aspect-ratio breakpoints stay defined once in the client viewport contract. Themes can style each band, but they do not redefine the responsive taxonomy.

## Related Docs

- [Theme Pack Authoring](/docs/authoring/theme-packs)
- [Theme Studio And Host Surfaces](/docs/extensions/theme-studio-and-host-surfaces)
- [Client Configuration](/docs/getting-started/configuration)

## Quick Reference

Use this article to understand Theme Packs in the MdWrk Product surface. MdWrk theme packs use a shared token and class-name contract so editor, renderer, extension, and workspace surfaces can be styled without private app selectors.

Key concepts covered here:

- live preview
- workspace organization
- extension host contracts
- theme portability
- @mdwrk/theme-contract

Useful follow-up pages:

- [Local-First Markdown Workspace](/docs/product/local-first-markdown-workspace)
- [Markdown Preview Editor](/docs/product/markdown-preview-editor)
- [Editor Basics](/docs/usage/editor-basics)

MdWrk treats themes as portable product surfaces.
