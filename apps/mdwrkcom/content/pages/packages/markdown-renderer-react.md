---
schema: "mdwrk.page.v1"
slug: "/packages/markdown-renderer-react/"
title: "Markdown Renderer React Package | MdWrk"
description: "The @mdwrk/markdown-renderer-react package provides React bindings for rendering Markdown through the same package family used by MdWrk."
h1: "@mdwrk/markdown-renderer-react"
entity: "MdWrk"
intent: "markdown renderer react package"
contentType: "package"
updatedAt: "2026-05-05"
subtitle: "Use the React renderer package when a product needs MdWrk-aligned Markdown rendering inside React."
faqs:
  - question: "What is @mdwrk/markdown-renderer-react?"
    answer: "It is the React binding package for rendering Markdown through MdWrk's renderer family."
---

`@mdwrk/markdown-renderer-react` gives React applications a package-level route into MdWrk-aligned Markdown rendering. It pairs with the renderer core package and keeps rendering behavior reusable outside the full workspace client.

Install:

```bash
npm install @mdwrk/markdown-renderer-react
```

Use this package when a product needs a React Markdown preview surface that can stay aligned with MdWrk examples, docs, and client behavior.

The React package is intentionally described as a reusable surface instead of a hidden implementation detail. That makes package adoption clear for teams that need preview behavior inside another application while keeping MdWrk-specific product positioning in the content pack.
