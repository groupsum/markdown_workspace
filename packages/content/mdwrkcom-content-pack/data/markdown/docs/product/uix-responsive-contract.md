---
title: UIX Responsive Contract
slug: product/uix-responsive-contract
section: Features
sectionOrder: 2
order: 18
toc: true
date: 2026-05-06
status: published
author: CobyCloud
displayAuthor: false
excerpt: The UIX responsive contract documents MdWrk viewport bands, aspect-ratio bands, height tiers, device classes, and theme responsibilities.
---

## Contract Summary

MdWrk defines viewport and aspect-ratio bands once and lets themes style those bands without redefining the breakpoints. The contract keeps app structure predictable across phone, tablet, desktop, wide, and ultra-wide workspaces.

The active contract is implemented in `apps/client/styles/base/viewports.css`.

## Aspect Bands

The workspace classifies layout by aspect ratio:

- portrait
- square-hybrid
- landscape
- wide
- ultra-wide

These bands guide shell density, pane stacking, sidebar behavior, and safe-area spacing.

## Width And Height Tiers

Width tiers are `xs`, `sm`, `md`, `lg`, `xl`, and `xxl`. Height tiers are `short`, `compact`, `tall`, and `ultra-tall`.

Themes may respond to these tiers, but the tier names and cutoffs remain a base contract.

## Device Class

The contract distinguishes touch and precision devices. Touch layouts can enlarge hit targets and simplify pane density, while precision layouts can preserve denser controls for keyboard and pointer workflows.

## Theme Responsibility

Themes are responsible for unique styling per band. They should not copy breakpoint definitions into theme files. A theme can change color, spacing, surface treatment, and visual density while leaving the base viewport taxonomy intact.

## Related Docs

- [Editor Basics](/features/editor-basics)
- [Desktop App Boundary](/features/desktop-app-boundary)
- [Theme Packs](/features/theme-packs)
