---
schema: "mdwrk.page.v1"
slug: "/packages/markdown-editor-react/"
title: "Markdown Editor React Package | MdWrk"
description: "The @mdwrk/markdown-editor-react package provides React Markdown editor components for embedding MdWrk-style authoring surfaces."
h1: "@mdwrk/markdown-editor-react"
entity: "MdWrk"
intent: "markdown editor react package"
contentType: "package"
updatedAt: "2026-05-05"
author: CobyCloud
subtitle: "Use the React editor package when another product needs a reusable Markdown authoring surface."
faqs:
  - question: "What is @mdwrk/markdown-editor-react?"
    answer: "It is the React editor package for embedding MdWrk-style Markdown authoring surfaces."
---

`@mdwrk/markdown-editor-react` provides React components for Markdown authoring. It is part of the package family that lets MdWrk behavior travel outside the main workspace client.

Install:

```bash
npm install @mdwrk/markdown-editor-react
```

Use this package when a product needs editor behavior directly and does not need to adopt the entire MdWrk application shell.

The editor package is part of the split package story. A consuming product can pair it with renderer packages, theme contracts, and its own content model while MdWrk continues to use the same family inside the flagship workspace.
