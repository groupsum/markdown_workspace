---
title: UI Refresh 1.3.28
slug: archive/ui-refresh-1-3-28
section: Archive
sectionOrder: 6
order: 25
date: 2026-05-02
status: published
---
## Quick Reference

Use this article to understand UI Refresh 1.3.28 in the MdWrk Archive surface. UI Refresh 1.3.28 explains how this MdWrk surface works in the current client and package system.

Key concepts covered here:

- theme portability
- developer package reuse

Useful follow-up pages:

- [Theme Packs](/docs/product/theme-packs)
- [Advanced Markdown Formatting](/docs/usage/advanced-formatting)
- [Client Installation](/docs/getting-started/installation)

## Client update: `mdwrk/mdwrkspace` 1.3.28

This release improves editing ergonomics and cleans up key UI surfaces:

- Improved view-toolbar formatting grouping with a dedicated strikethrough convenience control.
- Nested markdown list marker rendering now shows only the deepest visible marker.
- Project selector cleanup and stronger border treatment for project/theme controls.
- Project delete confirmation modal upgraded for readability and action clarity.
- System Configuration modal sizing and spacing refined.
- System Configuration tab/pane labeling de-duplicated.
- Key mapping cards updated so command purpose + key binding remain legible at narrow widths.

## Notes

The viewport contract remains centralized in `apps/client/styles/base/viewports.css`; themes continue to style each breakpoint band independently.
