# Certification boundary

Date: 2026-03-27
Status: Accepted boundary freeze with Phase 4 optional-profile checkpoint updates

## Purpose

This document defines exactly what is inside the certification boundary for this repository.

The boundary is important because this repository contains:

- deployable apps
- reusable packages
- contract packages
- first-party extensions
- a sample external extension package
- operational tooling
- generated artifacts
- documentation and evidence

A certification claim is only meaningful if the scope is frozen first.

## The two certification tracks

### 1. Repository-internal certification track

This track governs whether the repository may honestly claim:

- certifiably fully featured
- repository-internal RFC compliant

This track is defined by:

- repository ADRs
- package contracts and schemas
- dependency boundary rules
- compatibility rules
- release evidence rules
- the frozen Markdown targets in `docs/conformance/markdown-targets.md`

### 2. External Markdown conformance track

This track governs whether Markdown-facing surfaces may honestly claim conformance to the frozen Markdown target.

This track is defined by:

- `docs/conformance/markdown-targets.md`
- `docs/conformance/markdown-profile-matrix.json`

It is intentionally narrower than “all possible Markdown variants”.

## In-scope repository surfaces

### Applications

- `apps/client` — primary MdWork Markdown workspace UIX surface
- `apps/lander` — repository-owned application surface and package consumer

### Contract packages

- `packages/contracts/extension-manifest`
- `packages/contracts/extension-host`
- `packages/contracts/theme-contract`

### Shared packages

- `packages/shared/i18n`
- `packages/shared/icons`
- `packages/shared/testing`
- `packages/shared/ui-tokens`

### Renderer packages

- `packages/renderer/markdown-renderer-core`
- `packages/renderer/markdown-renderer-react`

### Editor packages

- `packages/editor/markdown-editor-core`
- `packages/editor/markdown-editor-react`

### Extension packages

- `packages/extensions/extension-runtime`
- `packages/extensions/extension-manager`
- `packages/extensions/extension-gemini-agent`
- `packages/extensions/extension-theme-studio`
- `packages/extensions/extension-catalog-hello`

### Examples

- `examples/editor-basic`
- `examples/renderer-basic`

### Tooling and evidence

- `tools/conformance/*`
- `tools/extensions/*`
- `tools/release/*`
- `artifacts/*`

## Markdown-specific certification scope

The Markdown-specific certification claim applies to the packages and app surfaces that parse, edit, preview, render, export, or otherwise claim Markdown behavior.

That includes at minimum:

- renderer packages
- editor packages
- the client app
- examples that demonstrate these packages
- any extension that injects Markdown-affecting commands, renderers, settings, or policy surfaces

## UIX parity scope for the client app

For the client app, “certifiably fully featured” includes user-visible parity obligations relative to v1 when v2 regressed a concrete feature.

The parity baseline is therefore:

- **reference baseline:** `markdown_workspace_v1`
- **implementation base:** `markdown_workspace_v2`

This does **not** mean v2 must reproduce all v1 architecture decisions.
It means v2 must reimplement concrete user-facing features that were lost, while preserving net improvements.

The working ledger is `docs/current-state/v1-v2-gap-ledger.md`.

## Explicitly preserved v2 improvements

The following are inside the boundary as **keep** decisions, not regressions to reverse:

- registry-driven shell composition
- extracted renderer/editor packages
- extension-capable i18n architecture
- theme/token/class contract formalization
- slugified preview heading IDs

## Claim boundaries

### “Certifiably fully featured”

This claim is allowed only when all in-scope packages/apps satisfy:

- `docs/conformance/package-certification-criteria.md`
- the relevant package/application evidence requirements
- the frozen Markdown target for Markdown-facing surfaces
- the v1→v2 parity closure ledger for the client UIX surface

### “Repository-internal RFC compliant”

This claim is allowed only when in-scope packages/apps conform to:

- accepted ADRs
- package contracts and schemas
- conformance tooling rules
- compatibility rules
- the frozen Markdown target where applicable

### “Markdown spec compliant”

This claim is allowed only for:

- CommonMark 0.31.2 core
- the default GFM 0.29-gfm profile
- optional profiles explicitly named in `markdown-profile-matrix.json`

No unnamed extension or unspecified Markdown dialect may be silently included in that claim.

## Current out-of-closure areas

At this Phase 0 checkpoint, the repository remains outside full certification closure because at least the following categories are still open:

- CommonMark/GFM corpus closure is not yet complete end-to-end
- only a subset of named optional extension profiles is currently inside the certified boundary; citations and markdown-in-html remain outside the certified optional-profile boundary in this checkpoint
- v1→v2 client UIX parity gaps remain open
- core locales, theme exposure, settings completeness, and Git parity remain open
- browser, visual, and packed-artifact evidence depth remain lighter than a final certification lane

See:

- `docs/current-state/phase-0-certification-freeze-assessment.md`
- `docs/current-state/v1-v2-gap-ledger.md`
- `docs/conformance/current-certification-status.md`

## Exit criteria for later certification claims

Later phases may only declare closure when all of the following are true:

1. the frozen target remains unchanged or is superseded by a new accepted ADR
2. all in-scope packages/apps meet the package certification criteria
3. Markdown-facing surfaces pass the frozen CommonMark/GFM/profile evidence lanes
4. the client UIX parity ledger is closed or explicitly waived with documented rationale
5. release evidence is generated from the publishable state of the workspace

## Honest status

This document freezes the boundary.
It does **not** by itself certify that the repository has already closed that boundary.
