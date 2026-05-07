---
schema: "mdwrk.page.v1"
slug: "/packages/markdown-renderer-core/"
title: "Markdown Renderer Core Package | MdWrk"
description: "The @mdwrk/markdown-renderer-core package provides self-contained Markdown parsing and rendering utilities for package-level preview and HTML output."
h1: "@mdwrk/markdown-renderer-core"
entity: "MdWrk"
intent: "markdown renderer core package"
contentType: "package"
updatedAt: "2026-05-05"
subtitle: "Use the renderer core package when a product needs Markdown parsing and HTML rendering without adopting the full MdWrk client."
faqs:
  - question: "What is @mdwrk/markdown-renderer-core?"
    answer: "It is the package-level Markdown parsing and rendering surface used by MdWrk renderer workflows."
---

`@mdwrk/markdown-renderer-core` provides Markdown parsing and rendering utilities for package-level preview and HTML output. It is useful when a product needs MdWrk-aligned Markdown behavior without adopting the full workspace client.

Install:

```bash
npm install @mdwrk/markdown-renderer-core
```

The package belongs to the reusable renderer family. The lander presents it as part of MdWrk product truth, while the portable lander packages only render the package-page shape, metadata, FAQ, and schema.

Use this surface when the implementation needs Markdown behavior that can be tested, documented, and reused without importing the full client. The package keeps renderer adoption explicit, which helps product teams separate content parsing, HTML output, and application-specific presentation.
