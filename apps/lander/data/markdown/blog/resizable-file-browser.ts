export const resizableFileBrowserContent = `---
title: Resizable File Browser + IndexedDB Preferences
date: 2026-02-11
author: MdWork Engineering
excerpt: We shipped a drag-resizable file explorer and now persist that layout preference automatically in IndexedDB.
---
# Resizable File Browser + IndexedDB Preferences

We just shipped a quality-of-life update to the workspace shell: the **File Browser is now resizable**.

## What's new

- Drag the new vertical divider between the explorer and editor panes.
- Resize the explorer width to match your project structure and workflow.
- Keep your preferred width even after refresh and restart.

## Automatic persistence in IndexedDB

Layout settings now persist in **IndexedDB** as part of UI preferences, so users keep a stable workspace profile across sessions.

### Why this matters

- Deep folder trees are easier to browse with a wider explorer.
- Focused writing workflows can reclaim space by narrowing the explorer.
- Preferences survive browser reloads without manual setup.

This release continues our local-first approach: user configuration lives with the app locally and restores instantly on startup.`;
