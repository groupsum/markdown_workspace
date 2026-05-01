---
title: Backstory: The Extension Host Became a First-Class mdwrk Surface
date: 2026-01-22
author: MdWrk Engineering
excerpt: The mdwrk client grew into an extension host with manifest, runtime, theme, settings, and trust-policy surfaces that deserve first-class documentation.
---
# Backstory: The Extension Host Became a First-Class mdwrk Surface

The extension story is not a sidecar detail. It is part of the mdwrk client contract.

## What shipped

The client now owns a governed extension stack:

- declarative manifests
- host-safe APIs
- runtime activation and lifecycle
- bundled extension registration
- settings, themes, i18n, and diagnostics adapters

## Why document it on the lander

Once the extension host existed, the public documentation surface needed to shift from "here is the lander" to "here is the mdwrk client and its extension platform."

That means the lander is now a documentation vehicle for the client and extension system, not the thing being documented.
