# Phase 13 checkpoint summary

Date: 2026-03-29

This updated v2 zip is a **Phase 13 RC freeze/versioning/promotion-prep checkpoint** built on top of:

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
- the Phase 11 package documentation/examples/boundary/evidence checkpoint; and
- the Phase 12 strict conformance closure-suite checkpoint.

## Phase 13 artifacts present in this checkpoint

- `docs/adr/ADR-0020-rc-freeze-versioning-and-promotion-prep-phase13-checkpoint.md`
- `docs/conformance/rc-freeze-phase13.md`
- `docs/current-state/phase-13-rc-freeze-assessment.md`
- `artifacts/conformance/latest/phase-13-rc-train-checkpoint.json`
- `artifacts/conformance/latest/phase-13-rc-train-results.json`
- `artifacts/conformance/latest/phase-13-release-status.json`
- `artifacts/conformance/latest/phase-13-release-status.txt`
- `artifacts/conformance/latest/phase-13-version-inventory.json`
- `artifacts/conformance/latest/phase-13-internal-range-audit.json`
- `artifacts/conformance/latest/phase-13-private-pack-report.json`
- `artifacts/conformance/latest/phase-13-rc-tarball-catalog.json`
- `artifacts/conformance/latest/phase-13-packed-install-report.json`
- `artifacts/conformance/latest/phase-13-packed-install-log.txt`
- `artifacts/conformance/latest/phase-13-app-and-example-validation.json`
- `artifacts/conformance/latest/phase-13-release-notes-draft.md`
- `artifacts/conformance/latest/phase-13-rc-acceptance-checklist.md`
- `artifacts/releases/rc.1/`

## What this checkpoint materially adds

- a real **RC.1** prerelease version line for the affected package families
- five committed release-family changesets covering client, editor, renderer, shared/theme, and extension families
- semver-compatible RC dependency ranges across internal dependents instead of workspace protocol links
- regenerated publishable tarballs under `artifacts/packs/`
- regenerated private validation tarballs for `@mdwrk/lander`, `@mdwrk/example-editor-basic`, and `@mdwrk/example-renderer-basic`
- regenerated extension artifacts and signatures from the RC line
- regenerated release evidence and publish-readiness records from the RC line
- successful portable-subset RC tarball install verification
- structural app/example validation against RC tarballs rather than workspace symlinks
- a dedicated `artifacts/releases/rc.1/` bundle

## Evidence captured in this checkpoint

Phase 13 records all of the following evidence outputs:

- manual-fallback `release:status` output and summary for the current RC line
- RC version inventory generated from committed changesets and workspace packages
- internal dependency range audit proving RC ranges replaced workspace protocol links in the affected set
- public tarball catalog and private tarball validation catalog
- packed-install verification log and report
- tarball manifest validation for the app and example validation surfaces
- release notes draft for RC.1
- RC acceptance checklist with explicit remaining blockers

## Honest current status

This checkpoint closes a meaningful **RC.1 preparation lane**.

It does **not** yet mean the repository is:

- certifiably fully featured
- repository-internally RFC compliant across the full frozen boundary
- fully Markdown spec compliant across the entire frozen CommonMark/GFM target
- accepted for final promotion

The main remaining blockers are:

- browser matrix remains blocked in the current environment
- browser-driven visual regression remains blocked in the current environment
- the hard closure rule for full frozen-target Markdown corpus closure remains blocked
- publish readiness remains blocked without an npm auth token

RC.1 is therefore **prepared**, but **not yet accepted**.

## Start here

- `docs/current-state/phase-13-rc-freeze-assessment.md`
- `docs/conformance/rc-freeze-phase13.md`
- `artifacts/conformance/latest/phase-13-rc-train-checkpoint.json`
- `artifacts/conformance/latest/phase-13-rc-train-results.json`
- `artifacts/conformance/latest/phase-13-rc-acceptance-checklist.md`
- `docs/conformance/current-certification-status.md`
