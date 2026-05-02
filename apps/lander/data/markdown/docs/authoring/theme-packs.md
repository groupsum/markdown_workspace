---
title: Theme Pack Authoring
slug: authoring/theme-packs
section: Authoring
sectionOrder: 3.5
order: 3
toc: true
date: 2026-05-02
status: published
---

Use this path when you want to author portable MdWrk theme artifacts rather than only switch between built-in themes.

## Primary surface

Theme authoring in this repository centers on:

- `@mdwrk/theme-contract` for the formal token and bridge surface
- `@mdwrk/extension-theme-studio` for first-party theme authoring UX
- the shared editor and renderer package families that consume those tokens

## What Theme Studio proves

Theme Studio exists to prove that theme authoring can happen through the governed extension and token contracts instead of through app-local DOM patching.

The first-party theme authoring flow covers:

- inspecting formal theme tokens
- previewing token changes against editor and renderer surfaces
- applying and reverting draft changes
- exporting portable theme artifacts

## Authoring rules

Theme packs should target the shared contract directly.
They should not depend on application-local selectors or private client-only CSS assumptions.

That means a valid theme authoring workflow should preserve:

- contract-backed token names
- editor and renderer bridge compatibility
- reusable package independence from `apps/client/*` styling internals

## Package and artifact expectations

Theme authoring may produce:

- exported CSS aligned with the theme contract
- portable theme package scaffolds
- previewable artifacts that can be consumed by the host, editor, and renderer surfaces

## Reference surfaces

Use these repo surfaces as the concrete reference:

```text
packages/extensions/extension-theme-studio/
packages/contracts/theme-contract/
docs/architecture/theme-studio-extension.md
docs/architecture/theme-mapping-guide.md
```
