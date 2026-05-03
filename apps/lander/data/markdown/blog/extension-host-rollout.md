---
title: Launch Extensions on the Same Governed Host the MdWrk Client Uses
date: 2026-04-26
status: published
author: CobyCloud
excerpt: The MdWrk client now presents a governed extension platform with manifest, runtime, manager, theme, language, and workspace surfaces that teams can adopt with a clear authoring path.
---
MdWrk now gives extension authors a first-class product surface with runtime APIs, compatibility rules, settings adapters, and installation flows that match the live client.

The April 26, 2026 extension milestone is anchored in these commits:

- [Implement continuous extension experiences](https://github.com/groupsum/markdown_workspace/commit/fe9a53bb)
- [Publish extension continuous experience release](https://github.com/groupsum/markdown_workspace/commit/b10b5332)
- [Add workspace module packages for files and git ops](https://github.com/groupsum/markdown_workspace/commit/d4efae4c)

## What extension authors get

MdWrk’s extension platform includes:

- `@mdwrk/extension-manifest` for declarative metadata
- `@mdwrk/extension-host` for host-safe APIs
- `@mdwrk/extension-runtime` for activation and lifecycle
- `@mdwrk/extension-manager` for installation and management UX
- first-party surfaces for theme authoring, language packs, Git operations, and workspace files

## Installation and authoring references

These docs carry the current golden usage details:

- [Extension platform](/docs/extensions/extension-platform)
- [Extension authoring overview](/docs/authoring/overview)
- [Extension authoring guide](/docs/authoring/extensions)

## Package-first install example

```bash
npm install @mdwrk/extension-runtime @mdwrk/extension-host @mdwrk/extension-manifest
```

## Manifest example

```json
{
  "id": "acme.release-notes-tools",
  "name": "Release Notes Tools",
  "version": "1.0.0",
  "publisher": "Acme",
  "engines": {
    "mdwrk": "^1.4.0"
  }
}
```

## Screenshot

![MdWrk extension manager pane inside the client workspace](/blog/media/extension-manager-pane.jpg)

This pane shows how MdWrk brings extension discovery and runtime management into the same workspace experience that writers and operators already use.

## Why this rollout sells

Extension teams want a host that communicates:

- where extensions register
- how compatibility is evaluated
- where settings and commands appear
- how first-party and third-party surfaces fit together

MdWrk now expresses that story clearly in product terms and package terms at the same time.

## Follow the repo history

- [Workspace and extension rollout history](/docs/history/workspace-and-extension-rollout)
- [Extension platform docs](/docs/extensions/extension-platform)
- [April 26 repository history](https://github.com/groupsum/markdown_workspace/commits/master/?since=2026-04-26T00:00:00Z&until=2026-04-27T00:00:00Z)
