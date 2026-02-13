---
title: UI Shell Quality Pass (Project Selector + System Config + Markdown Preview)
date: 2026-02-13
author: MarkSpace Engineering
excerpt: This pass refines toolbar formatting, nested list preview markers, project selector chrome, and system configuration readability across responsive viewports.
---
# UI Shell Quality Pass (Project Selector + System Config + Markdown Preview)

This release focuses on visual clarity, responsive polish, and consistency across the workspace shell.

## Included improvements

- Confirmed and exposed the **strikethrough convenience button** in the view toolbar format controls.
- Fixed nested markdown list marker behavior to avoid duplicate marker rendering in deep indentation scenarios.
- Removed redundant file-explorer header labeling and tightened explorer chrome.
- Updated project selector top branding to show the **active project title** while keeping the theme logo.
- Improved project selector border treatment and project-theme selector border fidelity.
- Enhanced project delete confirmation modal styling and hierarchy for clearer destructive-action context.
- Resized and tuned the System Configuration modal shell for better fit and less crowding.
- Removed duplicated tab labeling in System Configuration content panels.
- Refined keyboard mapping cards to keep purpose and keybinding text readable without overlap.

## Documentation updates

- Added a `STYLE_GUIDE.md` that documents supported aspect ratios, viewport bands, and device classes for validation.

These updates were validated with multiple themes and viewport classes including mobile portrait, tablet landscape, and ultra-wide desktop.
