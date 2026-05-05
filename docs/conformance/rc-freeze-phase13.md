# Phase 13 — RC freeze, versioning, and promotion prep

Date: 2026-03-29  
Checkpoint type: RC.1 train preparation checkpoint

## Purpose

This checkpoint converts the repository from a checkpoint/evidence state into a **prepared RC.1 release train**.
It does so without claiming that the train is already acceptable for final promotion.

## What was completed

### Release-family changesets

The repository now includes five Phase 13 release-family changesets under `.changeset/`:

- client family
- editor family
- renderer family
- shared/theme family
- extension family

### RC versions

Affected release families now carry `-rc.1` prerelease versions, including:

- `@mdwrk/mdwrkspace@1.4.0-rc.1`
- `@mdwrk/theme-contract@1.1.0-rc.1`
- `@mdwrk/ui-tokens@1.2.0-rc.1`
- `@mdwrk/markdown-renderer-core@1.1.0-rc.1`
- `@mdwrk/markdown-renderer-react@1.1.0-rc.1`
- `@mdwrk/markdown-editor-core@1.1.0-rc.1`
- `@mdwrk/markdown-editor-react@1.1.0-rc.1`
- `@mdwrk/i18n@1.1.0-rc.1`
- `@mdwrk/extension-runtime@1.1.0-rc.1`
- `@mdwrk/extension-manager@1.1.0-rc.1`
- `@mdwrk/extension-theme-studio@1.1.0-rc.1`
- `@mdwrk/extension-gemini-agent@1.1.0-rc.1`
- `@mdwrk/extension-catalog-hello@1.1.0-rc.1`
- `@mdwrk/mdwrkcom@0.0.11-rc.1`
- `@mdwrk/example-editor-basic@0.1.1-rc.1`
- `@mdwrk/example-renderer-basic@0.1.1-rc.1`

### Internal range updates

Apps/examples/internal dependents now use semver-compatible RC ranges instead of workspace protocol references for the affected internal package set.

### Tarball regeneration

The repository now carries:

- regenerated publishable tarballs under `artifacts/packs/`
- regenerated private validation tarballs under `artifacts/packs/private/`

### Extension artifacts and release evidence

The repository regenerated:

- extension installable artifacts/signatures under `artifacts/extensions/`
- release evidence under `artifacts/releases/latest/`
- publish-readiness metadata under `artifacts/releases/latest/`
- a dedicated RC bundle under `artifacts/releases/rc.1/`

### RC tarball validation

The RC validation lane is green for:

- the internal portable subset via real tarball install
- `@mdwrk/mdwrkspace` via tarball manifest validation
- `@mdwrk/mdwrkcom` via tarball manifest validation
- `@mdwrk/example-editor-basic` via tarball manifest validation
- `@mdwrk/example-renderer-basic` via tarball manifest validation

## Evidence

Primary Phase 13 artifacts:

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

## What this phase does not close

This checkpoint still does **not** close final promotion because the following blockers remain open:

- browser matrix lane
- browser-driven visual regression lane
- the hard closure rule for full frozen-target Markdown corpus closure
- publish readiness without an npm auth token

## Honest status

This is a valid **Phase 13 RC freeze/versioning/promotion-prep checkpoint**.
It proves that RC.1 is prepared.
It does **not** yet prove that RC.1 is accepted for promotion.
