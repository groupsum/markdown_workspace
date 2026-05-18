---
title: Structured Data Learning Map Makes the MdWrk Lander Pipeline Easier to Teach
date: 2026-05-18
status: published
author: CobyCloud
excerpt: MdWrk adds a developer-facing learning map that connects structured data builders, React JSON-LD components, and lander discovery helpers in one visual reference.
featuredImage: /blog/media/mdwrk-structured-data-learning-map.png
featuredImageAlt: MdWrk structured data learning map showing structured data builders, lander React components, and lander SEO outputs
---

The May 18 update adds a developer learning map for the MdWrk lander pipeline. The visual gives contributors one place to understand how content intent turns into schema.org JSON-LD, how the React lander renders that graph, and how the lander helper package emits discovery artifacts for the published site.

This work is useful when developers need to move across three related packages without losing the boundary between them:

- `@mdwrk/structured-data` owns the typed JSON-LD builders.
- `@mdwrk/lander-react` owns the React components and page graph assembly.
- `@mdwrk/lander-seo` owns metadata, graph artifacts, sitemap inputs, robots output, and crawler-facing files.

## What the map shows

The map follows the pipeline from left to right.

First, structured data types such as `WebPage`, `WebSite`, `Organization`, `SoftwareApplication`, `Article`, `FAQPage`, `BreadcrumbList`, `Dataset`, `Event`, `Product`, `Course`, `Recipe`, and `JobPosting` start as builder inputs in the structured-data package. These builders keep schema.org nodes explicit and reusable instead of burying JSON-LD inside individual pages.

Next, lander React components such as `JsonLd`, `StructuredDataNode`, `ReadActionStructuredData`, and `buildLanderJsonLdGraph` turn those builders into a page-level graph. The runtime output is still the familiar script tag:

```html
<script type="application/ld+json">
```

Finally, the lander helper layer packages the same content model into site-wide outputs: page metadata, canonical URLs, Open Graph tags, Twitter cards, `jsonld-graph.json`, sitemap resources, `robots.txt`, and `llms.txt`.

## Learning asset

![MdWrk structured data learning map](/blog/media/mdwrk-structured-data-learning-map.png)

## Why this matters for contributors

The lander is easier to extend when each package keeps a clear job. A developer adding a new schema type can start in `@mdwrk/structured-data`, expose the relevant React integration in `@mdwrk/lander-react`, and then confirm that the discovery helper output still reflects the page content accurately.

That separation also makes reviews cleaner. Package work can be evaluated at the builder layer, component work can be evaluated at the rendering layer, and publishing work can be evaluated through generated artifacts. The learning map gives those review paths a shared vocabulary.

## How to use the map

Use the map when onboarding a contributor, reviewing a structured-data change, or deciding where a new page intent belongs.

1. Start with the schema.org type or content intent.
2. Confirm the matching builder surface in `@mdwrk/structured-data`.
3. Trace the React component or graph helper that renders it.
4. Verify the lander helper output that makes the page discoverable.

For package-level details, continue with the MdWrk package surfaces and lander documentation:

- [Package Surfaces](/proof/package-surfaces)
- [Quickstart](/docs/quickstart)
- [Theme Packs](/docs/theme-packs)
