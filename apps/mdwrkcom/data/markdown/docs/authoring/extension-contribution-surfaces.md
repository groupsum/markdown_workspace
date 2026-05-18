---
title: Extension Contribution Surfaces
slug: authoring/extension-contribution-surfaces
section: Authoring
sectionOrder: 3.5
order: 4
toc: true
date: 2026-05-18
status: published
author: CobyCloud
excerpt: Extension contribution surfaces document the shared manifest, host, runtime, hook, pane, toolbar, settings, diagnostics, and catalog contracts for MdWrk extensions.
---

## Contribution Contract

MdWrk extension contribution surfaces are declared in the manifest, typed by the host contracts, and registered through the runtime. The contribution contract keeps extension packages from inventing local protocols for panes, toolbars, hooks, settings, or diagnostics.

The governed surfaces include:

- panes and panels
- view toolbar items
- settings schemas and settings views
- hook registrations
- compatibility ranges
- permissions and trust disclosure
- diagnostics and recovery actions
- external catalog fixtures

## Runtime Hooks

Runtime hooks are registered through the extension context and disposed with the rest of the extension activation state. A production default boundary should prevent development-only contribution defaults from leaking into release behavior.

First-party extensions should use the shared contribution contract so Extension Manager and app hosts can render contribution metadata consistently.

## Related Docs

- [Extension Authoring Guide](/docs/authoring/extension-authoring-guide/)
- [Extension Platform](/docs/extensions/extension-platform/)
- [Package-Owned Documentation](/features/package-owned-documentation/)
