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

MdWrk treats themes as portable product surfaces.

## Theme Contract

Theme packs target shared tokens, bridge variables, and class names. This keeps theme behavior portable across the editor, renderer, host, and extension views.

## Theme Studio

The Theme Studio extension provides a first-party authoring workflow for inspecting tokens, previewing editor and renderer changes, applying draft values, reverting them, and exporting theme artifacts.

## Viewport Contract

Viewport and aspect-ratio breakpoints stay defined once in the client viewport contract. Themes can style each band, but they do not redefine the responsive taxonomy.

## Related Docs

- [/docs/authoring/theme-packs](/docs/authoring/theme-packs)
- [/docs/extensions/theme-studio-and-host-surfaces](/docs/extensions/theme-studio-and-host-surfaces)
- [/docs/getting-started/configuration](/docs/getting-started/configuration)
