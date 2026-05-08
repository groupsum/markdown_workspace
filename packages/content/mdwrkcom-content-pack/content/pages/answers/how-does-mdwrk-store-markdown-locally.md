---
schema: "mdwrk.page.v1"
slug: "/answers/how-does-mdwrk-store-markdown-locally/"
title: "How Does MdWrk Store Markdown Locally?"
description: "MdWrk uses browser-local persistence for workspace state so authoring can remain device-local unless users choose an integration."
h1: "How does MdWrk store Markdown locally?"
entity: "MdWrk"
intent: "how does mdwrk store markdown locally"
contentType: "faq"
updatedAt: "2026-05-05"
author: CobyCloud
subtitle: "A direct answer about MdWrk local persistence and storage boundaries."
faqs:
  - question: "How does MdWrk store Markdown locally?"
    answer: "MdWrk uses browser-local persistence for workspace state so normal authoring can remain local-first."
---

MdWrk uses browser-local persistence for workspace state so authoring can remain device-local unless the user chooses a workflow that moves content elsewhere. This supports local writing, preview, and organization as the default path.

Local persistence does not remove export, sync, or repository workflows. It clarifies when content stays local and when an integration moves it across a boundary.

The answer is product-specific. The portable lander package only provides reusable validation, rendering, SEO, schema, and static output mechanics.
