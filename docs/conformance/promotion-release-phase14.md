# Phase 14 — promotion and release

Date: 2026-03-30  
Checkpoint type: promotion/release evidence bundle checkpoint

## Purpose

This checkpoint packages the existing RC.1 line into a promotion-ready release bundle while preserving the evidence chain.

It exists to ensure that publish order, notes, catalogs, compatibility statements, and evidence files all agree on the same release boundary and the same blockers.

## What this checkpoint produces

### Promotion manifests

- dependency-ordered publish manifest
- published-package status manifest
- promotion-scoped extension catalog
- Git tag metadata
- GitHub release metadata

### Tarball bundles

- extension artifact bundle tarball
- final evidence tarball

### Release narrative

- final Phase 14 release notes with explicit claim language and waivers

### Promotion bundle

- `artifacts/releases/promotion-rc.1/`

## Claim language used in this checkpoint

This checkpoint does **not** make either of the final certification claims.

Specifically:

- it does **not** claim repository-internal certification closure; and
- it does **not** claim repository-internal plus externally frozen CommonMark/GFM target conformance.

The strongest honest statement used in this checkpoint is:

> repository-internal release-readiness evidence only; no final certification claim is made.

## Required release-note boundaries included

The generated release notes include:

- certification boundary
- markdown target boundary
- optional extension profile boundary
- compatibility baselines
- known waivers/blockers

## What remains blocked

- npm publication (no auth token)
- Git tag creation (no Git repository/remote context in the checkpoint zip)
- GitHub release creation (no repository/remote context in the checkpoint zip)
- browser matrix lane
- browser-driven visual regression lane
- full frozen-target Markdown closure rule

## Honest status

This Phase 14 checkpoint is a valid **promotion-and-release evidence bundle checkpoint**.

It is **not** yet:

- a completed public release
- a completed repository-internal certification closure
- a completed externally frozen markdown target conformance release
