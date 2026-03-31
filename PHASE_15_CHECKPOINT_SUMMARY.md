# Phase 15 checkpoint summary

Date: 2026-03-30

This updated v2 zip is a **Phase 15 post-release stabilization and support-window checkpoint** built on top of:

- the Phase 0 certification-target freeze;
- the Phase 1 release-train and compatibility-baseline freeze;
- the Phase 2 renderer/CommonMark-core checkpoint;
- the Phase 3 default-GFM checkpoint;
- the Phase 4 optional-profile checkpoint;
- the Phase 5 editor semantics and authoring UX checkpoint;
- the Phase 6 preview/export/render-policy checkpoint;
- the Phase 7 shell parity checkpoint;
- the Phase 8 settings/data/session/Git parity checkpoint;
- the Phase 9 theme inventory/token contract/visual parity checkpoint;
- the Phase 10 i18n/language UX/catalog coverage checkpoint;
- the Phase 11 package documentation/examples/boundary/evidence checkpoint;
- the Phase 12 strict conformance closure-suite checkpoint;
- the Phase 13 RC freeze/versioning/promotion-prep checkpoint; and
- the Phase 14 promotion/release checkpoint.

## Phase 15 artifacts present in this checkpoint

- `docs/adr/ADR-0022-post-release-stabilization-and-support-window-phase15-checkpoint.md`
- `docs/conformance/post-release-stabilization-phase15.md`
- `docs/current-state/phase-15-stabilization-assessment.md`
- `artifacts/conformance/latest/phase-15-stabilization-checkpoint.json`
- `artifacts/conformance/latest/phase-15-stabilization-results.json`
- `artifacts/conformance/latest/phase-15-support-window-policy.json`
- `artifacts/conformance/latest/phase-15-monitoring-matrix.json`
- `artifacts/conformance/latest/phase-15-evidence-integrity-manifest.json`
- `artifacts/conformance/latest/phase-15-follow-on-roadmap.md`
- `artifacts/conformance/latest/phase-15-minimum-closure-checklist.md`
- `artifacts/conformance/latest/phase-15-stabilization-output.txt`
- `artifacts/releases/support-window-rc.1/`
- `tools/conformance/generate-phase15-stabilization-checkpoint.mjs`

## What this checkpoint materially adds

- a short, explicit 14-day post-release compatibility window policy for the prepared `promotion-rc.1` train
- a patch-only stabilization rule for the prepared train unless a deliberate next minor is opened
- an explicit monitoring matrix covering:
  - extension activation failures
  - theme regressions
  - i18n regressions
  - release artifact compatibility drift
- an immutable SHA-256 evidence manifest covering the Phase 12 through Phase 14 release-evidence chain plus the promotion bundle contents
- a support-window release bundle under `artifacts/releases/support-window-rc.1/`
- a follow-on roadmap for intentionally out-of-boundary next-train candidates
- a minimum closure checklist that records why the repository still may **not** claim final success

## Recorded Phase 15 evidence in this checkpoint

This checkpoint records:

- `15/17` green Phase 15 stabilization checks
- `2/17` blocked Phase 15 stabilization checks
- `70` immutable evidence files hashed into the support-window integrity manifest
- a generated immutable evidence tarball under `artifacts/releases/support-window-rc.1/immutable-evidence-bundle.tar.gz`

## Honest current status

This checkpoint closes a meaningful **post-release stabilization/support-window maturity lane**.

It does **not** yet mean the repository is:

- certifiably fully featured
- repository-internally RFC compliant across the full frozen boundary
- fully Markdown spec compliant across the entire frozen CommonMark/GFM target
- actually published as a public release

The main remaining blockers are:

- there is still no public published release in this environment, so the support window is policy-defined for the prepared bundle rather than live on published npm artifacts
- the publication step remains blocked from Phase 14
- the earlier strict-closure blockers from Phase 12 and Phase 13 remain recorded in the evidence
- the minimum closure checklist still shows that final claim success is unavailable

## Start here

- `docs/current-state/phase-15-stabilization-assessment.md`
- `docs/conformance/post-release-stabilization-phase15.md`
- `artifacts/conformance/latest/phase-15-stabilization-checkpoint.json`
- `artifacts/conformance/latest/phase-15-stabilization-results.json`
- `artifacts/conformance/latest/phase-15-minimum-closure-checklist.md`
- `artifacts/releases/support-window-rc.1/README.md`
- `docs/conformance/current-certification-status.md`
