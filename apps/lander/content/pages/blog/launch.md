---
schema: "mdwrk.page.v1"
slug: "/blog/launch/"
title: "MdWrk launch notes for a static local-first Markdown lander"
description: "The MdWrk launch article explains why the public lander is compiled from Markdown into static HTML, JSON-LD, LLM indexes, and Markdown mirrors."
h1: "MdWrk launch notes"
entity: "MdWrk"
intent: "MdWrk launch story"
contentType: "blog"
updatedAt: "2026-05-04"
publishedAt: "2026-05-04"
answer: "The MdWrk launch story centers on a local-first Markdown workspace and a public lander that compiles Markdown into static, verifiable, machine-readable artifacts before deployment."
faqs:
  - question: "Why does the MdWrk lander compile static HTML?"
    answer: "Static HTML makes the primary public content readable before JavaScript, which supports search, accessibility, answer engines, and deployment-independent verification."
parent: "/"
related:
  - "/docs/quickstart/"
  - "/features/local-first-markdown/"
tags:
  - launch
  - static
  - markdown
---

MdWrk's public launch story is not only about a Markdown editor. It is also about how the product explains itself. The public lander uses Markdown files as source content, validates frontmatter, builds a normalized registry, and produces static artifacts that can be verified before the production domain is live.

## Static Before Runtime

The first principle is that public content should not require a browser application shell. If a crawler, assistant, or user downloads the raw HTML response, the primary content should already be present in the page.

## Machine-Readable By Default

The build emits JSON-LD, sitemap data, robots policy, LLM index files, a content index, and Markdown mirrors. These artifacts are generated from the same registry so content identity, metadata, and links stay aligned.

## Why It Matters

A Markdown product should be able to prove its own documentation quality. MdWrk uses the compiler to check source validity, static readability, SEO signals, answer visibility, AI-oriented artifacts, and internal links without depending on production deployment.

## What Comes Next

The static compiler can grow as the content set grows. The important contract is already clear: Markdown body content remains the article, frontmatter remains metadata, and answer or FAQ metadata must be visibly rendered when used for structured data.
