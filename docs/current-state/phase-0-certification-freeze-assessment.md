# Phase 0 certification freeze assessment

Date: 2026-03-27
Checkpoint type: documentation and target-freeze checkpoint built on the v2 monorepo baseline

## What this checkpoint completes

This checkpoint completes the **Phase 0 certification-target freeze** for the v2 repository.

The repository now has all of the required Phase 0 freeze artifacts:

- `docs/conformance/markdown-targets.md`
- `docs/conformance/markdown-profile-matrix.json`
- `docs/conformance/certification-boundary.md`
- `docs/adr/ADR-0007-markdown-target-freeze-and-certification-boundary.md`

It also now records the current state of the repository against the v1 reference and the v2 implementation base.

## What this checkpoint does not complete

This checkpoint does **not** complete the full delivery program for:

- certifiably fully featured UIX
- certifiably fully Markdown spec compliant packages/apps
- repository-wide strict conformance closure
- release promotion and publication from a fully closed evidence bundle

In other words, the target is now frozen, but the full implementation and proof work still remains.

## Current state of the repository

### Strong existing foundations already present in v2

The v2 workspace already contains real architectural advances that should be preserved:

- a workspaces-based monorepo with reusable package families
- extracted renderer packages
- extracted editor packages
- contract packages for extension host/manifest/theme compatibility
- extension runtime and bundled extension packages
- a shared token package and shared i18n package
- release/conformance tooling under `tools/*`
- generated evidence under `artifacts/*`
- a registry-driven shell in the client app

### Why the repository is still not certifiable yet

The frozen target is now explicit, but the repository still has open closure gaps across four major dimensions:

1. **Markdown spec closure**
   - the frozen CommonMark/GFM target is not yet closed against an end-to-end external corpus lane
   - optional profiles are not yet fully proven package/editor/preview/export-wide
2. **Client UIX parity**
   - the v1→v2 comparison still shows user-facing regressions that must be reimplemented in v2
3. **Settings, themes, and i18n completeness**
   - v2 surfaces exist but several are incomplete, hidden, or not fully wired
4. **Evidence depth**
   - browser, visual, packed-artifact, and full certification evidence remain lighter than the final target

## Current v1→v2 parity position

The v1 repository remains the parity reference for concrete end-user features that were removed or degraded during the v2 architectural shift.

The current must-close v1→v2 categories are:

- Git settings parity, especially PAT-based flows and refresh wiring
- restore/import/session settings parity
- editor toolbar and list-authoring parity
- preview normalization parity where v1 had extra handling
- action-rail/status-bar parity
- theme selector parity
- core locale parity and language-selection UI
- token/layout rhythm parity
- extension settings completeness

The full ledger is maintained in `docs/current-state/v1-v2-gap-ledger.md`.

## Current Markdown conformance position

The repository can no longer rely on a vague future “RFC audit.”
The Markdown target is now frozen as:

- CommonMark 0.31.2 core
- GFM 0.29-gfm default profile
- named optional profiles only

What remains to close:

- corpus ingestion and automated validation for CommonMark core
- corpus ingestion and automated validation for the default GFM features
- explicit profile gates and evidence for optional extensions
- raw HTML trust/sanitization lane testing
- preview/export evidence aligned to the frozen target
- release evidence that ties published artifacts to the frozen target

## Current package version snapshot

The checkpoint is built on the existing v2 package inventory:

- root workspace: `0.1.5`
- `@mdwrk/mdwrkspace`: `1.3.52`
- `@mdwrk/lander`: `0.0.11`
- `@mdwrk/extension-host`: `1.0.1`
- `@mdwrk/extension-manifest`: `1.0.0`
- `@mdwrk/theme-contract`: `1.0.0`
- `@mdwrk/markdown-renderer-core`: `1.0.0`
- `@mdwrk/markdown-renderer-react`: `1.0.1`
- `@mdwrk/markdown-editor-core`: `1.0.1`
- `@mdwrk/markdown-editor-react`: `1.0.2`
- `@mdwrk/extension-runtime`: `1.0.1`
- bundled extension packages: `1.0.1`
- `@mdwrk/i18n`: `1.0.0`
- `@mdwrk/ui-tokens`: `1.0.1`
- examples: `0.1.1`

This checkpoint does not bump package versions. It is a **documentation freeze checkpoint**, not a release-candidate or publication checkpoint.

## What later phases must deliver before certification claims are honest

### For a certifiably fully featured UIX claim

Later phases must close at least the following:

- client parity regressions relative to v1
- settings/data/session/Git completeness
- status bar, action rail, and responsive shell parity decisions
- theme inventory exposure
- language selection and core locale coverage
- editor toolbar/list/gutter fidelity

### For a certifiably fully Markdown spec compliant claim

Later phases must close at least the following:

- CommonMark core test corpus
- GFM default test corpus
- explicit policy and evidence for optional profiles
- raw HTML policy evidence
- preview/export stability evidence
- package/example/app behavior alignment

### For repository-wide certification

Later phases must close at least the following:

- package-family compatibility closure
- packed-artifact install closure
- extension activation and settings closure
- browser and visual evidence closure
- release evidence and promotion closure

## Honest status

This updated v2 checkpoint is a valid **Phase 0 freeze artifact**.
It is **not yet** a certifiably fully featured or certifiably fully Markdown spec compliant repository.

That is now documented explicitly, with a frozen target, a frozen boundary, and a living gap ledger.
