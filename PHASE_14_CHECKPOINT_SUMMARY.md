# Phase 14 checkpoint summary

Date: 2026-03-30

This updated v2 zip is a **Phase 14 promotion and release checkpoint** built on top of:

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
- the Phase 12 strict conformance closure-suite checkpoint; and
- the Phase 13 RC freeze/versioning/promotion-prep checkpoint.

## Phase 14 artifacts present in this checkpoint

- `docs/adr/ADR-0021-promotion-and-release-phase14-checkpoint.md`
- `docs/conformance/promotion-release-phase14.md`
- `docs/current-state/phase-14-promotion-assessment.md`
- `artifacts/conformance/latest/phase-14-promotion-release-checkpoint.json`
- `artifacts/conformance/latest/phase-14-promotion-release-results.json`
- `artifacts/conformance/latest/phase-14-publish-order.json`
- `artifacts/conformance/latest/phase-14-published-packages.json`
- `artifacts/conformance/latest/phase-14-extension-catalog.json`
- `artifacts/conformance/latest/phase-14-git-tag-metadata.json`
- `artifacts/conformance/latest/phase-14-github-release-metadata.json`
- `artifacts/conformance/latest/phase-14-release-notes.md`
- `artifacts/conformance/latest/phase-14-published-artifact-compatibility.json`
- `artifacts/conformance/latest/phase-14-publish-output.txt`
- `artifacts/conformance/latest/phase-14-release-evidence-output.txt`
- `artifacts/releases/promotion-rc.1/`
- `tools/conformance/generate-phase14-promotion-checkpoint.mjs`

## What this checkpoint materially adds

- a dependency-ordered publish manifest spanning contracts, shared packages, renderer, editor, extensions, examples, and apps
- a promotion-scoped extension catalog derived from the signed extension artifacts already present in the repository
- a tarball bundle of the current extension artifacts
- a final evidence tarball preserving the Phase 12, Phase 13, and Phase 14 release evidence chain
- promotion-scoped Git tag metadata and GitHub release metadata files
- final Phase 14 release notes with explicit claim language, boundaries, baselines, and waivers
- an explicit published-artifact compatibility status record stating what is and is not validated in the current environment
- a dedicated `artifacts/releases/promotion-rc.1/` bundle that keeps the promotion evidence together

## Honest current status

This checkpoint closes a meaningful **promotion-and-release packaging lane**.

It does **not** yet mean the repository is:

- certifiably fully featured
- repository-internally RFC compliant across the full frozen boundary
- fully Markdown spec compliant across the entire frozen CommonMark/GFM target
- actually published to npm or GitHub

The main remaining blockers are:

- browser matrix remains blocked in the current environment
- browser-driven visual regression remains blocked in the current environment
- the hard closure rule for full frozen-target Markdown corpus closure remains blocked
- npm publication remains blocked without an auth token
- Git tag creation and GitHub release creation remain blocked because the checkpoint zip does not include a Git repository/remote-auth context

This means the repo now has a **promotion bundle**, **release notes**, **catalogs**, and **evidence tarballs**, but **not an actual public release**.

## Start here

- `docs/current-state/phase-14-promotion-assessment.md`
- `docs/conformance/promotion-release-phase14.md`
- `artifacts/conformance/latest/phase-14-promotion-release-checkpoint.json`
- `artifacts/conformance/latest/phase-14-promotion-release-results.json`
- `artifacts/releases/promotion-rc.1/README.md`
- `docs/conformance/current-certification-status.md`
