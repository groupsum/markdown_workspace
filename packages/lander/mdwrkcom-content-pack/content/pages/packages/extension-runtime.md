---
schema: "mdwrk.page.v1"
slug: "/packages/extension-runtime/"
title: "Extension Runtime Package | MdWrk"
description: "The @mdwrk/extension-runtime package provides portable runtime utilities for governed MdWrk extension behavior."
h1: "@mdwrk/extension-runtime"
entity: "MdWrk"
intent: "extension runtime package"
contentType: "package"
updatedAt: "2026-05-05"
subtitle: "Use the extension runtime package when building governed commands, panes, settings, and integration surfaces."
faqs:
  - question: "What is @mdwrk/extension-runtime?"
    answer: "It is the portable package for MdWrk extension runtime behavior, lifecycle, and host-facing contracts."
---

`@mdwrk/extension-runtime` provides portable runtime utilities for governed MdWrk extension behavior. It supports the package-level extension model behind commands, panes, settings, and integrations.

Install:

```bash
npm install @mdwrk/extension-runtime
```

Use this package when extension behavior needs to stay explicit, inspectable, and compatible with MdWrk host surfaces.

The runtime package keeps extension behavior out of undocumented client patches. A package author can reason about lifecycle, host context, compatibility, and trust policy as stable surfaces that can be documented, validated, and reused across delivery targets.
