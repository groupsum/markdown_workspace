---
schema: "mdwrk.page.v1"
slug: "/features/local-first-markdown/"
title: "Local-first Markdown workspace for portable documents — MdWrk"
description: "MdWrk documents a local-first Markdown workflow where writing, preview, workspace state, extension behavior, and export boundaries are explicit."
h1: "Local-first Markdown workspace"
entity: "MdWrk"
intent: "local-first markdown workspace"
contentType: "feature"
updatedAt: "2026-05-04"
subtitle: "MdWrk is a local-first Markdown workspace that keeps authoring centered on portable Markdown files, browser-managed workspace state, and explicit export or sync boundaries."
faqs:
  - question: "What does local-first mean for MdWrk?"
    answer: "Local-first means the product documentation treats local writing and preview as the default mental model, while sync, export, and external integrations are opt-in workflows."
parent: "/"
related:
  - "/features/offline-markdown-editor/"
  - "/privacy/"
tags:
  - local-first
  - markdown
  - workspace
---

MdWrk frames Markdown authoring around local control. The workspace should make it clear where documents are edited, what state is held by the client, and when a user chooses to move content into another system.

## Workspace State

The workspace can keep document state, open tabs, preferences, and editor configuration close to the user. Public documentation must describe that boundary plainly so users do not assume hidden uploads or hosted storage.

## Portable Markdown

Markdown remains valuable because it is durable, readable, and easy to move. MdWrk reinforces that value by documenting features in terms of Markdown body content, static mirrors, package surfaces, and explicit workflow boundaries.

## Clear Integration Boundaries

GitHub sync, extension-based workflows, and export routes can still be useful, but they should be named as integrations. The local-first documentation explains the point where a local authoring session becomes a networked operation.

## Static Public Pages

The public lander itself follows the same philosophy. It compiles Markdown into static HTML and machine-readable artifacts so important content can be inspected without running a client application.
