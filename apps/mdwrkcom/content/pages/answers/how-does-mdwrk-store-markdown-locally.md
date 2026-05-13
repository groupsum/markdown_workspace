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
parent: "/answers/"
related:
  - "/features/indexeddb-markdown-storage/"
  - "/answers/does-mdwrk-require-a-server/"
  - "/trust/privacy-boundary/"
faqs:
  - question: "How does MdWrk store Markdown locally?"
    answer: "MdWrk uses browser-local persistence for workspace state so normal authoring can remain local-first."
---

MdWrk uses browser-local persistence for workspace state so authoring can remain device-local unless the user chooses a workflow that moves content elsewhere. This keeps local writing, preview, and organization available as the default path.

Local persistence does not remove export, sync, or repository workflows. It makes the storage boundary clearer by separating normal local editing from the moments when a user intentionally moves content across systems.

That boundary is part of the broader MdWrk local-first model, where Markdown authoring starts on the device and connected workflows remain explicit choices.
