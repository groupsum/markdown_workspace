---
schema: "mdwrk.page.v1"
slug: "/features/extension-runtime/"
title: "Extension Runtime | MdWrk"
description: "MdWrk extensions use governed runtime, manifest, compatibility, and trust surfaces instead of patching the client directly."
h1: "Extension runtime"
entity: "MdWrk"
intent: "markdown workspace extension runtime"
contentType: "feature"
updatedAt: "2026-05-05"
subtitle: "The MdWrk extension runtime gives package authors a documented way to add commands, panes, settings, and integrations."
faqs:
  - question: "What is the MdWrk extension runtime?"
    answer: "The extension runtime is the governed host surface for adding commands, panes, settings, and integrations to MdWrk."
  - question: "Do extensions patch the client directly?"
    answer: "No. Extensions are expected to use documented manifests, compatibility rules, lifecycle hooks, and trust boundaries."
---

The MdWrk extension runtime gives package authors a governed way to extend the workspace. Instead of patching the client directly, extensions describe their contribution through documented package and manifest surfaces.

This matters for trust and portability. Runtime lifecycle, compatibility metadata, installable artifacts, and host context stay explicit, which makes extension behavior easier to inspect and easier to verify.

The reusable lander package does not contain any MdWrk extension claim. MdWrk-specific extension facts live here in the content pack, while the lander packages render feature pages generically.
