---
title: Backstory: Splitting the mdwrk Client into Reusable Editor and Preview Packages
date: 2025-12-12
author: MdWrk Engineering
excerpt: Why the mdwrk client stopped hiding its editor and preview implementation inside the app and promoted those surfaces into reusable public packages.
---
# Backstory: Splitting the mdwrk Client into Reusable Editor and Preview Packages

We needed the markdown workspace to stop behaving like one private app bundle.

## The problem

When editor and preview logic live only inside the client app, documentation, examples, tests, and extensions all end up coupling to client internals. That is not a durable product boundary.

## The split-out

We promoted the authoring and rendering stack into reusable package families:

- `@mdwrk/markdown-editor-core`
- `@mdwrk/markdown-editor-react`
- `@mdwrk/markdown-renderer-core`
- `@mdwrk/markdown-renderer-react`

## The payoff

That split let the client remain the integration host while examples, documentation, and extension tooling all consumed the same public package surfaces.

The lander should have reflected that immediately. It does now.
