---
title: Docs Surface Realignment for MdWrk
date: 2026-04-30
status: published
author: CobyCloud
excerpt: The lander now treats MdWrk as the product surface and uses the site to document the client, shared packages, and extension platform with clearer metadata and navigation.
---
# Docs Surface Realignment for MdWrk

The lander should not document itself as the product.

## What changed

We tightened the public docs surface so it points at the real MdWrk product boundaries:

- the workspace client
- the editor and renderer package families
- the extension host and bundled extensions
- the documented history behind the client split-out

## Why it matters

This keeps the site aligned with the actual package and client architecture. The lander is the public documentation layer, not the product being documented.

## Follow-on cleanup

This pass also cleaned blog ordering, removed weak placeholder entries from the rendered list, and improved how docs titles use frontmatter metadata.
