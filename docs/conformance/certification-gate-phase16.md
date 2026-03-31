# Phase 16 — certification gate before promotion

Date: 2026-03-30
Checkpoint type: policy-correction / final-closure sequencing checkpoint

## Purpose

This checkpoint corrects the closure model so that certification happens **before** promotion/release.

The repository now distinguishes between:

- the **certification gate**; and
- the **promotion gate**.

## Certification gate

The certification gate controls whether the repository may honestly claim certification.

It now includes:

- strict conformance lanes
- parity lanes
- package-boundary and contract-boundary validation
- RC-artifact validation
- hard closure rules

It explicitly excludes:

- npm publication
- Git tag creation
- GitHub release creation
- live post-release support window on published artifacts
- published-artifact runtime compatibility

## Promotion gate

The promotion gate happens only after the certification gate is fully green.

It covers:

- publish from validated RC artifacts in dependency order
- validate from the published artifacts
- create the real tag / GitHub release
- open the live short support window on published artifacts
- keep the live support window patch-only unless a deliberate next minor opens

## Current certification blockers

This checkpoint records four certification blockers:

- browser matrix lane
- browser-driven visual regression lane
- full packed-tarball install lane for the release set
- hard Markdown closure rule for the full frozen-target CommonMark/GFM/optional-profile corpus

These are the only things that still block a final certification claim under the corrected model.

## Current promotion blockers

Promotion is still blocked by the absence of:

- publication from validated RC artifacts
- published-artifact runtime compatibility validation
- real Git tag creation
- real GitHub release creation
- live support window on published artifacts

These are no longer treated as certification blockers.

## Real browser execution policy

The repository now records **Playwright Test** as the canonical real-browser execution engine for the final browser matrix and browser-driven visual regression lanes.

## Recorded artifacts

- `artifacts/conformance/latest/phase-16-certification-gate-results.json`
- `artifacts/conformance/latest/phase-16-certification-gate-checkpoint.json`
- `artifacts/conformance/latest/phase-16-closure-policy.json`
- `artifacts/conformance/latest/phase-16-certification-gate-checklist.md`
- `artifacts/conformance/latest/phase-16-promotion-gate-checklist.md`
- `artifacts/conformance/latest/phase-16-final-closure-sequence.md`

## Honest status

This Phase 16 checkpoint does **not** certify the repository.
It makes the closure model coherent so the remaining work is unambiguously a certification-first path rather than a publish-first path.
