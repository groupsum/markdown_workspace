---
schema: "mdwrk.page.v1"
slug: "/features/indexeddb-markdown-storage/"
title: "IndexedDB Markdown Storage | MdWrk"
description: "MdWrk uses browser-local persistence so workspace state can remain on the user device during normal authoring."
h1: "IndexedDB Markdown storage"
entity: "MdWrk"
intent: "indexeddb markdown storage"
contentType: "feature"
updatedAt: "2026-05-05"
subtitle: "Browser-local persistence keeps MdWrk's default authoring workflow independent from hosted document storage."
faqs:
  - question: "How does MdWrk store Markdown locally?"
    answer: "MdWrk uses browser-local persistence for workspace state so normal authoring can remain local-first."
  - question: "Does local storage prevent sync?"
    answer: "No. Sync and export workflows can be explicit integrations without becoming the default storage layer."
---

IndexedDB Markdown storage is part of MdWrk's local-first product boundary. The workspace can keep project state on the user's device during ordinary writing, preview, and organization, instead of requiring every editing action to depend on a hosted authoring backend.

This design keeps storage policy understandable. Local persistence supports daily authoring. Export, repository, and sync flows remain visible choices that move content across a boundary when the user chooses that workflow.

The public lander presents this as product truth from the MdWrk content pack. Generic lander packages only enforce the content model, metadata, FAQ, and diagnostics that make the page portable.
