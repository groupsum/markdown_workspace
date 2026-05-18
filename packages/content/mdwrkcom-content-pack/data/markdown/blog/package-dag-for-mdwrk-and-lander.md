---
title: MdWrk Package Dependency Maps Show How Apps, Shared Packages, and Lander Packages Connect
date: 2026-05-18
status: published
author: CobyCloud
excerpt: Package dependency maps show how the app entrypoints, shared foundations, editor and renderer packages, and lander packages fit together.
featuredImage: /blog/media/mdwrk-package-dag.svg
featuredImageAlt: Top-down MdWrk package dependency map showing direct internal dependency arrows between apps, packages, and contracts
---

The May 18 update adds a visual package DAG for MdWrk contributors. The graph shows the direct internal dependency relationships between app entrypoints, package surfaces, and foundational contracts in the workspace.

This map is useful because the MdWrk repo is intentionally split into focused package lanes. Shared packages provide reusable contracts and primitives. Editor, renderer, and extension packages build the writing workspace. Lander packages turn content, structured data, SEO helpers, React components, and themes into mdwrk.com. The app layer then consumes those packages through `apps/client` and `apps/mdwrkcom`.

## Package DAG

The DAG set is split into focused images so each surface can be read without forcing unrelated package families into the same graph.

### apps/client

![apps/client package DAG](/blog/media/mdwrk-dag-apps-client.svg)

### apps/mdwrkcom

![apps/mdwrkcom package DAG](/blog/media/mdwrk-dag-apps-mdwrkcom.svg)

### Lander packages

![Lander package DAG](/blog/media/mdwrk-dag-lander-packages.svg)

## What the graph shows

Each graph is top-down. The entrypoint or package roots sit at the top, the packages they consume sit below them, and foundational contracts sit near the bottom. Each arrow points from a consumer package to the internal package it depends on.

The graph includes shared foundations and contracts:

- `@mdwrk/theme-contract`, `@mdwrk/ui-tokens`, `@mdwrk/icons`, `@mdwrk/i18n`, `@mdwrk/testing`, and `@mdwrk/structured-data`
- `@mdwrk/extension-manifest` and `@mdwrk/extension-host`

Those packages support the MdWrk editor, renderer, and extension lane:

- `@mdwrk/markdown-renderer-core` and `@mdwrk/markdown-renderer-react`
- `@mdwrk/markdown-editor-core`, `@mdwrk/markdown-editor-react`, and `@mdwrk/markdown-edit-in-renderer-react`
- `@mdwrk/extension-runtime`, `@mdwrk/extension-manager`, `@mdwrk/extension-theme-studio`, `@mdwrk/extension-language-pack-studio`, `@mdwrk/extension-workspace-files`, `@mdwrk/extension-git-ops`, and `@mdwrk/extension-gemini-agent`

The lander lane stays separate and focused on the public site:

- `@mdwrk/lander-content-contract`
- `@mdwrk/lander-core`
- `@mdwrk/lander-react`
- `@mdwrk/lander-seo`
- `@mdwrk/lander-theme`
- `@mdwrk/lander-markdown-content-adapter`
- `@mdwrk/lander-page-templates`
- `@mdwrk/lander-page-template-presets`
- `@mdwrk/mdwrkcom-content-pack`

`apps/mdwrkcom` consumes lander packages, renderer packages, structured data, and UI tokens. `apps/client` consumes the editor, renderer, extension, shared UI, and contract packages.

## Why this matters

The DAG gives contributors a practical review map. A change to `@mdwrk/structured-data` can be checked for its effect on `@mdwrk/lander-react` and `apps/mdwrkcom`. A change to `@mdwrk/ui-tokens` can be reviewed through both the workspace client and the lander. A change to the extension runtime can be evaluated through the extension packages that depend on it before it reaches the client app.

The same structure also keeps package ownership clear. Shared foundations stay small and reusable. Runtime packages stay focused on editing and rendering behavior. Lander packages stay focused on publishing, discovery, and reusable public-site content. App packages assemble those capabilities without hiding the dependency paths.

## How to use it

Use the DAG when planning package work, reviewing pull requests, or deciding where a new capability belongs.

1. Start with the package that owns the primitive or behavior.
2. Follow its outgoing dependency path to the packages that consume it.
3. Check the app entrypoint that exposes the behavior to users.
4. Keep new functionality in the lowest package lane that owns the domain cleanly.

For adjacent package context, continue with the MdWrk package and lander references:

- [Package Surfaces](/proof/package-surfaces)
- [Quickstart](/docs/quickstart)
- [Extension Host](/docs/extension-host)
