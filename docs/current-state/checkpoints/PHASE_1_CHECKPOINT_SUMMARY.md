# Phase 1 checkpoint summary

Date: 2026-03-27

This updated v2 zip is a **Phase 1 release-train freeze checkpoint** built on top of the Phase 0 certification-target freeze.

## Phase 1 artifacts present in this checkpoint

- `docs/operations/version-train.md`
- `docs/operations/release-groups.md`
- `docs/operations/compatibility-baselines.md`
- `docs/adr/ADR-0008-release-train-groups-and-compatibility-baselines.md`
- `docs/current-state/phase-1-release-train-freeze-assessment.md`
- `docs/current-state/phase-1-package-graph-audit.md`
- `artifacts/conformance/latest/phase-1-release-train-freeze.json`
- `artifacts/conformance/latest/package-release-matrix.json`
- `artifacts/conformance/latest/phase-1-package-graph-audit.json`
- `tools/release/generate-phase1-release-train-audit.mjs`

## Key repository updates included in this checkpoint

- `.changeset/config.json` carries the frozen linked Changesets groups for renderer, editor, shared `i18n`/`ui-tokens`, and the extension runtime family
- `README.md` and `docs/README.md` point to the Phase 1 freeze and audit materials
- `docs/conformance/current-certification-status.md` and `docs/conformance/evidence-artifacts.md` now include the audited Phase 1 state
- `artifacts/conformance/latest/README.md` now lists the machine-readable Phase 1 audit artifacts

## Honest current status

This checkpoint freezes the release train, package groups, and compatibility baselines.
It also includes an explicit package-graph audit proving that every audited release unit in the zip is mapped to a frozen release group, owner lane, SemVer policy, compatibility declaration, and promotion path.

It does **not** yet mean the repository is:

- certifiably fully featured
- repository-internally RFC compliant across the full frozen boundary
- fully Markdown spec compliant against the frozen CommonMark/GFM target

## Start here

- `docs/current-state/phase-1-release-train-freeze-assessment.md`
- `docs/current-state/phase-1-package-graph-audit.md`
- `docs/operations/release-groups.md`
- `docs/operations/version-train.md`
- `docs/operations/compatibility-baselines.md`
- `docs/conformance/current-certification-status.md`
