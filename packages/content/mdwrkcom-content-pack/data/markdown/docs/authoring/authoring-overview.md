---
title: Authoring Overview
slug: authoring/overview
section: Authoring
sectionOrder: 3.5
order: 1
toc: true
date: 2026-05-02
status: published
author: CobyCloud
excerpt: MdWrk authoring documentation groups extension, theme pack, and language pack workflows into focused surfaces for package and product contributors.
---

## Authoring domains

The current public authoring domains documented on the lander are:

- [Extension authoring](/docs/authoring/extensions)
- [Theme pack authoring](/docs/authoring/theme-packs)
- [Language pack authoring](/docs/authoring/language-packs)

## Scope

These docs are for package authors, extension maintainers, and internal builders who need to create reusable MdWrk surfaces.

They are not the same as:

- browser or PWA usage flows
- local client operation
- extension installation or runtime-only guidance

## Ground rules

Authoring in this repository follows a few durable rules:

- reusable surfaces should live in publishable packages
- browser hosts do not run raw `npm install` at runtime for external extensions
- host/runtime trust, manifest, and compatibility declarations are part of the authoring contract
- theme and language authoring must target the shared contracts rather than app-local shortcuts

## Quick Reference

Use this article to understand Authoring Overview in the MdWrk Authoring surface. Authoring Overview explains how this MdWrk surface works in the current client and package system.

Key concepts covered here:

- local Markdown files
- live preview
- extension host contracts
- theme portability
- developer package reuse

Useful follow-up pages:

- [Local-First Markdown Workspace](/features/local-first-markdown-workspace)
- [Extension Platform](/docs/extensions/extension-platform)
- [Theme Packs](/features/theme-packs)

The authoring section explains how to produce MdWrk-facing artifacts rather than only how to consume them.
