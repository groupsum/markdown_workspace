# Phase 11 — package documentation, examples, contract boundaries, and evidence

Date: 2026-03-28
Checkpoint type: documentation/evidence/certifiability checkpoint

## Scope of this phase

This checkpoint focuses on making the repository **credibly certifiable** as a monorepo of reusable packages, extensions, applications, and examples.

The primary concerns are:

- package-level API/reference visibility
- category-appropriate documentation completeness
- explicit boundary evidence between packages and apps
- example coverage that validates public package APIs
- machine-readable repository evidence rather than ad hoc README coverage alone

## What this checkpoint adds

### Workspace-wide certification matrix

- `docs/reference/workspace-package-certification-matrix.md`
- `artifacts/conformance/latest/phase-11-package-evidence.json`

These artifacts record the package/app/example evidence surface across the workspace.

### Generated reference pages

One generated reference page now exists for each workspace package/app/example under:

- `docs/reference/packages/`
- `docs/reference/apps/`
- `docs/reference/examples/`

### App integration docs

- `docs/apps/mdwrkspace-app.md`
- `docs/apps/lander-app.md`

### Example docs

- `docs/examples/editor-basic-example.md`
- `docs/examples/renderer-basic-example.md`

### Boundary and release evidence docs

- `docs/reference/package-boundary-map.md`
- `docs/operations/release-evidence-phase11.md`

## Recorded results in this checkpoint

The Phase 11 evidence matrix records:

- 20 workspace package/app/example entries audited
- 201 structural certification checks
- 201/201 checks passing

## Why this matters

Earlier checkpoints made the repository increasingly implemented.
Phase 11 makes it increasingly **reviewable, explainable, and certifiable**.

A repository can be technically functional and still fail certification review if:

- package boundaries are unclear
- exports are not well documented
- examples are not clearly public-surface fixtures
- extension manifests/settings/i18n/test posture are not easy to audit
- apps do not document their public config/deploy/support posture

This checkpoint addresses those evidence-quality issues.

## What this checkpoint still does not close

This checkpoint still does **not** by itself close:

- final frozen-target Markdown corpus closure
- browser-driven visual regression closure
- packed release artifact/promotion closure
- final repository-internal RFC closure across every remaining open surface

## Certification statement for this phase

This checkpoint is a valid **Phase 11 package documentation/examples/boundary/evidence checkpoint**.
It materially improves the repository’s certifiability.
It does **not** yet authorize the repository to claim that it is already:

- certifiably fully featured
- repository-internally RFC compliant across the full frozen boundary
- fully Markdown spec compliant across the full frozen CommonMark/GFM target
