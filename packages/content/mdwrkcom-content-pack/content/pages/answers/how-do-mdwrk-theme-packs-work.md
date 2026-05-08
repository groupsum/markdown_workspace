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
faqs:
  - question: "How do MdWrk theme packs work?"
    answer: "MdWrk theme packs target governed token and surface contracts instead of patching product internals."
---

MdWrk theme packs target governed token and surface contracts so styling can travel across editor, preview, and lander surfaces. The goal is to make visual customization portable instead of tying every theme to private implementation details.

Theme contracts help package authors, extension authors, and product contributors work against stable styling surfaces. A MdWrk theme pack can express product identity while reusable packages keep their generic behavior.

This page is MdWrk content. Other products can supply different theme packs while reusing the same lander rendering system.
