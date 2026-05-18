---
schema: "mdwrk.page.v1"
slug: "/answers/how-do-mdwrk-theme-packs-work/"
title: "How Do MdWrk Theme Packs Work?"
description: "MdWrk theme packs target governed token and surface contracts so styling can travel across editor, preview, and lander surfaces."
h1: "How do MdWrk theme packs work?"
entity: "MdWrk"
intent: "how do mdwrk theme packs work"
contentType: "faq"
updatedAt: "2026-05-05"
author: CobyCloud
subtitle: "A direct answer about MdWrk theme pack contracts and portable styling."
parent: "/answers/"
related:
  - "/features/"
  - "/packages/theme-contract/"
  - "/packages/"
faqs:
  - question: "How do MdWrk theme packs work?"
    answer: "MdWrk theme packs target governed token and surface contracts instead of patching product internals."
---

MdWrk theme packs target governed token and surface contracts so styling can travel across editor, preview, and lander surfaces. The goal is to keep visual customization portable instead of tying every theme to private implementation details.

That contract-based approach helps package authors, extension authors, and product contributors work against stable styling surfaces. A theme can express product identity while the underlying reusable packages keep their generic behavior.

In practice, theme packs make it easier to change appearance without rewriting renderer, editor, or extension logic.
