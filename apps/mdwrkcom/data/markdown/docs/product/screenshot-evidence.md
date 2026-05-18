---
title: Screenshot Evidence
slug: product/screenshot-evidence
section: Features
sectionOrder: 2
order: 20
toc: true
date: 2026-05-18
status: published
author: CobyCloud
displayAuthor: false
excerpt: Screenshot evidence documents the MdWrk expectation that UI changes carry reviewable visual artifacts for affected themes, views, modes, panes, and modals.
---

## Evidence Scope

MdWrk UI work needs screenshot evidence for every affected view, mode, pane, modal, and theme. Responsive work also needs the governed aspect-ratio and viewport bands that apply to the changed surface.

The screenshot evidence contract applies to:

- `apps/client`
- `apps/desktop`
- `apps/mdwrkcom`
- first-party extension panes and settings
- rendered lander pages and reusable lander package surfaces

## Manifest Requirements

Screenshot evidence should be reviewable as files plus a manifest. The manifest should name the package owner, route or view, theme, mode, viewport band, and artifact path.

When a change does not alter visible rendering, the validator should say so by checking an explicit non-visual contract instead of silently skipping visual proof.

## Related Docs

- [UIX Responsive Contract](/features/uix-responsive-contract/)
- [Package-Owned Documentation](/features/package-owned-documentation/)
- [View Toolbar](/features/view-toolbar/)
