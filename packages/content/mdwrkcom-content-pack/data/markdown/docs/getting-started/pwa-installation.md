---
title: PWA Installation
slug: getting-started/pwa-installation
section: Getting Started
sectionOrder: 1
order: 3
toc: true
date: 2026-05-02
status: published
author: CobyCloud
excerpt: The Progressive Web App path keeps the MdWrk client in the web platform, but lets supported browsers install it as a dedicated app window.
---

## What it is

The Progressive Web App path keeps the MdWrk client in the web platform, but lets supported browsers install it as a dedicated app window.

## Typical install flow

1. Open the MdWrk site in a PWA-capable browser.
2. Use the browser's install action from the address bar, app menu, or share sheet.
3. Launch the installed app from its icon or application list.

## Best fit

- frequent daily writing
- a focused app window without full browser chrome
- users who want updates delivered through the browser-managed install flow

## Update behavior

PWA updates are delivered through the normal web app update lifecycle. When a new build is ready, the client can prompt you to refresh into the updated version.

## Storage and backup

PWA mode still uses browser-managed local storage. Installability does not turn the app into a server-backed product, so exports and backups are still your responsibility.

## When to choose another path

Choose browser use when you do not want to install anything.
Choose local setup when you need a repo checkout, local build scripts, or self-hosted control.
Choose standalone modules when you need package-level reuse instead of the full workspace shell.

## Quick Reference

Use this article to understand PWA Installation in the MdWrk Getting Started surface. PWA Installation explains how this MdWrk surface works in the current client and package system.

Key concepts covered here:

- local Markdown files
- live preview
- workspace organization
- privacy-first storage
- extension host contracts

Useful follow-up pages:

- [Local-First Markdown Workspace](/features/local-first-markdown-workspace)
- [PWA Installation](/docs/getting-started/pwa-installation)
- [Browser Use](/docs/getting-started/browser-use)

Use the PWA route when you want the browser-hosted workspace with an installable app shell.
