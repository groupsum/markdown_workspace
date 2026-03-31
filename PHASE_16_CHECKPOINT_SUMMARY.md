# Phase 16 checkpoint summary

Date: 2026-03-30

This updated v2 zip is a **Phase 16 certification-gate policy correction and final-closure sequencing checkpoint** built on top of:

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
- the Phase 13 RC freeze/versioning/promotion-prep checkpoint;
- the Phase 14 promotion/release checkpoint; and
- the Phase 15 post-release stabilization/support-window checkpoint.

## Phase 16 artifacts present in this checkpoint

- `docs/adr/ADR-0023-certification-before-promotion-phase16-checkpoint.md`
- `docs/conformance/certification-gate-phase16.md`
- `docs/current-state/phase-16-certification-gate-assessment.md`
- `artifacts/conformance/latest/phase-16-certification-gate-checkpoint.json`
- `artifacts/conformance/latest/phase-16-certification-gate-results.json`
- `artifacts/conformance/latest/phase-16-closure-policy.json`
- `artifacts/conformance/latest/phase-16-certification-gate-checklist.md`
- `artifacts/conformance/latest/phase-16-promotion-gate-checklist.md`
- `artifacts/conformance/latest/phase-16-final-closure-sequence.md`
- `artifacts/conformance/latest/phase-16-certification-gate-output.txt`
- `tools/conformance/generate-phase16-certification-gate-checkpoint.mjs`

## What this checkpoint materially adds

- the endgame is now explicitly split into a **certification gate** and a **promotion gate**
- publication is no longer treated as a prerequisite for the statement “the repository is certified”
- the promotion-only requirements are now explicitly separated from the certification-only requirements:
  - publish from validated RC artifacts
  - published-artifact runtime compatibility
  - Git tag creation
  - GitHub release creation
  - live support window on published artifacts
- the final claim language is now frozen one last time to:
  - repository-internal certifiably fully featured
  - repository-internal certifiably compliant
  - externally frozen CommonMark/GFM markdown target conformance for the declared profile set
- the final closure sequence is now recorded as a repository artifact rather than an external conversational plan
- Playwright Test is now recorded as the canonical real-browser execution engine for the blocked browser matrix and visual regression lanes

## Recorded Phase 16 evidence in this checkpoint

This checkpoint records:

- `16/20` green certification-gate checks
- `4/20` blocked certification-gate checks
- `1/6` green promotion-gate checks
- `5/6` blocked promotion-gate checks

The certification blockers are now explicit and narrow:

- browser matrix lane blocked
- browser-driven visual regression lane blocked
- full packed-tarball install lane blocked for the full release set
- hard closure rule `no unresolved P0 markdown conformance failures` blocked because the repo still lacks the full official end-to-end frozen-target CommonMark/GFM/optional-profile corpus closure

## Honest current status

This checkpoint closes a meaningful **policy-correction and final-closure-planning lane**.

It does **not** yet mean the repository is:

- certifiably fully featured
- repository-internally RFC compliant across the full frozen boundary
- fully Markdown spec compliant across the entire frozen CommonMark/GFM target
- ready for promotion or publication

The main remaining reasons are:

- the certification gate still has four blocked checks
- the promotion gate has not started execution in a real publish-capable environment
- final certification still requires a real browser matrix, browser-driven visual regression, the full packed-tarball install lane, and the full frozen-target Markdown hard-closure rule to go green

## Start here

- `docs/current-state/phase-16-certification-gate-assessment.md`
- `docs/conformance/certification-gate-phase16.md`
- `artifacts/conformance/latest/phase-16-certification-gate-checkpoint.json`
- `artifacts/conformance/latest/phase-16-certification-gate-results.json`
- `artifacts/conformance/latest/phase-16-certification-gate-checklist.md`
- `artifacts/conformance/latest/phase-16-promotion-gate-checklist.md`
- `artifacts/conformance/latest/phase-16-final-closure-sequence.md`
- `docs/conformance/current-certification-status.md`
