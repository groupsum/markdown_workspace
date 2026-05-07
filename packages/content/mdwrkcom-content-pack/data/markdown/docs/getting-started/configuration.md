---
title: Client Configuration
slug: getting-started/configuration
section: Getting Started
sectionOrder: 1
order: 6
toc: true
date: 2026-05-02
status: published
excerpt: Theme Selection Open Settings -> Theme to switch between built-in theme families. Themes are contract-backed and flow through the editor, preview, export, and extension theme APIs.
---

## Theme Selection
Open **Settings -> Theme** to switch between built-in theme families. Themes are contract-backed and flow through the editor, preview, export, and extension theme APIs.

## Workspace Defaults
- **Autosave**: Enabled by default for local-first persistence.
- **Default View**: Choose Editor, Preview, or Split to match your writing style.
- **Markdown Profiles**: Enable optional profile features without forking the renderer.
- **Git Sync**: Provide credentials only when you want to push or pull.
- **Extension Settings**: First-party and external extensions register their own schema-backed settings panels.

## Lander Environment Variables
The lander reads public navigation and metadata values at build time:

| Variable | Purpose |
| :--- | :--- |
| `VITE_SITE_URL` | Canonical production origin used for sitemap and robots output. |
| `VITE_APP_URL` | Installed app URL used by hero app-entry actions. |
| `VITE_DEMO_URL` | URL for the live demo call to action. |
| `VITE_GITHUB_REPO_URL` | Repository link used by the header GitHub action. |
| `VITE_NPM_REPO_URL` | npm organization or package URL. |
| `VITE_NPM_CLIENT_VERSION` | Published client package version shown in the hero. |
| `VITE_NPM_ESM_CDN_URL` | ESM CDN URL used by package examples. |
| `VITE_X_URL` | X profile URL shown in the footer. |
| `VITE_COMMUNITY_URL` | Community destination shown in the footer. |

Defaults are kept in the lander source so local builds remain usable without a full environment file.

## Reverse Proxy
Run the lander container on the internal Docker network and route traffic through your reverse proxy.

## Package-Level Configuration
If you consume the split packages directly:

- `@mdwrk/markdown-editor-react` owns source-authoring behavior.
- `@mdwrk/markdown-renderer-react` owns rendered markdown output.
- `@mdwrk/theme-contract` owns theme token and bridge compatibility.

## Metadata and Discovery
The lander includes production metadata for:

- canonical links
- Open Graph previews
- Twitter card previews
- favicon assets
- `robots.txt`
- `llms.txt`
- generated `sitemap.xml`

Regenerate the sitemap during every production build so public routes stay aligned with the current Markdown docs.

## Quick Reference

Use this article to understand Client Configuration in the MdWrk Getting Started surface. Client Configuration explains how this MdWrk surface works in the current client and package system.

Key concepts covered here:

- local Markdown files
- live preview
- workspace organization
- extension host contracts
- theme portability

Useful follow-up pages:

- [Local-First Markdown Workspace](/features/local-first-markdown-workspace)
- [Markdown Preview Editor](/features/markdown-preview-editor)
- [Editor Basics](/features/editor-basics)

The MdWrk client ships with sensible defaults. These settings are part of the client and extension host surface, not the lander.
