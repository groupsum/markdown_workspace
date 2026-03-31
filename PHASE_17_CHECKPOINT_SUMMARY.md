# Phase 17 checkpoint summary

Date: 2026-03-30

This updated v2 zip is a **Phase 17 Gate B certification-closure rerun checkpoint** built on top of:

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
- the Phase 14 promotion/release checkpoint;
- the Phase 15 post-release stabilization/support-window checkpoint; and
- the Phase 16 certification-gate policy checkpoint.

## Phase 17 artifacts present in this checkpoint

- `docs/adr/ADR-0024-gate-b-certification-closure-rerun-phase17-checkpoint.md`
- `docs/conformance/gate-b-certification-closure-phase17.md`
- `docs/current-state/phase-17-gate-b-assessment.md`
- `artifacts/conformance/latest/phase-17-certification-gate-checkpoint.json`
- `artifacts/conformance/latest/phase-17-certification-gate-results.json`
- `artifacts/conformance/latest/phase-17-certification-gate-checklist.md`
- `artifacts/conformance/latest/phase-17-commonmark-official-summary.json`
- `artifacts/conformance/latest/phase-17-gfm-official-summary.json`
- `artifacts/conformance/latest/phase-17-optional-profile-summary.json`
- `artifacts/conformance/latest/phase-17-browser-matrix-report.json`
- `artifacts/conformance/latest/phase-17-visual-regression-report.json`
- `artifacts/conformance/latest/phase-17-packed-release-set-install-report.json`
- `artifacts/conformance/latest/phase-17-packed-release-set-install-log.txt`
- `artifacts/conformance/latest/phase-17-evidence-bundle-manifest.json`
- `artifacts/conformance/latest/phase-17-gate-b-output.txt`
- `tools/conformance/generate-phase17-gate-b-checkpoint.mjs`
- `packages/renderer/markdown-renderer-core/tests/commonmark-official-corpus.mjs`
- `packages/renderer/markdown-renderer-core/tests/gfm-official-corpus.mjs`
- `packages/renderer/markdown-renderer-core/tests/spec-corpus-utils.mjs`
- `playwright.config.ts`
- `apps/client/tests/playwright/`
- `tools/ci/run-playwright-browser-matrix.mjs`

## What this checkpoint materially adds

- the full official CommonMark 0.31.2 corpus now has an executable lane inside the repository instead of only subset evidence
- the full official GFM 0.29-gfm corpus now has an executable lane inside the repository instead of only subset evidence
- the Gate B certification blockers are now measured against the real official corpus counts rather than only the old subset lanes
- the repository now carries explicit Playwright browser-matrix scaffolding for the still-blocked real-browser closure lanes
- the repository now carries an explicit blocked-state report for:
  - browser matrix
  - browser-driven visual regression
  - full packed tarball install for the release set
- the hard markdown closure rule is now blocked by measured failure counts rather than by an unspecified “not yet fully audited” statement

## Recorded Phase 17 evidence in this checkpoint

This checkpoint records:

- `7/12` green certification lanes
- `5/12` blocked certification lanes
- `4/5` green hard-closure rules
- `1/5` blocked hard-closure rules

The blocked certification items are now explicit:

- full official CommonMark corpus lane blocked (`360/652` passing, `292` failing)
- full official GFM corpus lane blocked (`370/672` passing, `302` failing)
- browser matrix lane blocked
- browser-driven visual regression lane blocked
- full packed-tarball install lane blocked
- hard rule `no unresolved P0 markdown conformance failures` blocked because the official corpus lanes still fail

## Honest current status

This checkpoint closes a meaningful **Gate B measurement lane**.

It does **not** yet mean the repository is:

- certifiably fully featured
- repository-internally RFC compliant across the full frozen boundary
- fully Markdown spec compliant across the entire frozen CommonMark/GFM target

The main remaining reasons are:

- the full official CommonMark lane still fails in hundreds of cases
- the full official GFM lane still fails in hundreds of cases
- the browser matrix lane is still blocked in the current environment
- the browser-driven visual regression lane is still blocked in the current environment
- the full release-set packed tarball install lane is still blocked in the current environment
- the hard markdown closure rule therefore still cannot go green

## Start here

- `docs/current-state/phase-17-gate-b-assessment.md`
- `docs/conformance/gate-b-certification-closure-phase17.md`
- `artifacts/conformance/latest/phase-17-certification-gate-checkpoint.json`
- `artifacts/conformance/latest/phase-17-certification-gate-results.json`
- `artifacts/conformance/latest/phase-17-certification-gate-checklist.md`
- `docs/conformance/current-certification-status.md`
