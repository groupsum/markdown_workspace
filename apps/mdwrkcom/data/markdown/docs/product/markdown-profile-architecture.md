---
title: Markdown Profile Architecture
slug: product/markdown-profile-architecture
section: Features
sectionOrder: 2
order: 17
toc: true
date: 2026-05-06
status: published
excerpt: Markdown profile architecture describes how MdWrk separates CommonMark, GFM, custom profile options, renderer configuration, and evidence snapshots.
---

## Profile Purpose

Markdown profiles let MdWrk describe which Markdown behaviors are active for editing, preview, export, and conformance evidence. The profile layer keeps rendering policy explicit instead of burying it inside ad hoc parser flags.

## Current Surfaces

The current profile implementation spans:

- renderer core profile definitions
- client profile settings
- editor and preview configuration
- generated conformance artifacts
- SSOT feature, claim, test, and evidence links

Client-facing profile configuration lives under `apps/client/src/features/markdownProfiles`. Renderer behavior lives under `packages/renderer/markdown-renderer-core`.

## Profile Responsibilities

A profile should declare:

- enabled Markdown extensions
- raw HTML policy
- task-list behavior
- underline and link policy
- heading anchor behavior
- renderer and preview expectations
- evidence lane used to prove the profile

## Evidence Lane

Profile evidence should point at executable tests, generated snapshots, and conformance reports. This keeps profile claims auditable across package changes, app settings changes, and release gates.

## Related Docs

- [Rendering And Preview](/features/rendering-and-preview)
- [Advanced Markdown Formatting](/features/advanced-formatting)
- [Developer Documentation](/features/developer-documentation)
