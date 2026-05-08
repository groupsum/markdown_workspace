---
schema: "mdwrk.page.v1"
slug: "/packages/theme-contract/"
title: "Theme Contract Package | MdWrk"
description: "The @mdwrk/theme-contract package defines theme token and compatibility contracts for MdWrk editor, preview, extension, and lander surfaces."
h1: "@mdwrk/theme-contract"
entity: "MdWrk"
intent: "theme contract package"
contentType: "package"
updatedAt: "2026-05-05"
author: CobyCloud
subtitle: "Use the theme contract package when styling needs to target governed tokens instead of private UI internals."
faqs:
  - question: "What is @mdwrk/theme-contract?"
    answer: "It is the package that defines governed theme tokens and compatibility surfaces for MdWrk packages and apps."
---

`@mdwrk/theme-contract` defines theme token and compatibility contracts for MdWrk surfaces. It helps themes travel across editor, preview, extension, and lander experiences without patching private implementation details.

Install:

```bash
npm install @mdwrk/theme-contract
```

This package anchors the difference between reusable visual shape and MdWrk-specific styling truth. Product theme packs can supply identity while generic packages keep stable token names.

The contract matters for portability because themes should not depend on private app selectors. A product-specific theme can express its own visual system while editor, preview, extension, and lander packages continue to consume documented tokens.
