# Phase 8 — settings, data, session, and Git parity

Date: 2026-03-28
Checkpoint type: executable source-level parity checkpoint

## Scope

This document records the Phase 8 checkpoint that closes the major settings/data/session/Git parity lane identified by the v1→v2 audit.

The boundary for this checkpoint is:

- data settings surfaces
- session settings surfaces
- Git settings surfaces
- extension settings registration and schema rendering
- client runtime wiring required to make those settings rows functional

## What is in scope

### Settings / Data

- restore workspace from JSON
- real restore-state flow for the active project
- retained IndexedDB export flow
- secondary PWA version visibility in settings

### Settings / Session

- exposed auto-save toggle
- exposed restore-session toggle
- exposed line-number toggle
- persistence continuity through the existing state layer

### Settings / Git

- auth mode selector: PAT vs OIDC
- PAT provider selector
- PAT token input
- PAT readiness/status feedback
- PAT-backed repository normalization and inference
- GitHub/GitLab/Gitea PAT-mode selection path
- manual repository refresh event support
- automatic refresh-event dispatch after relevant save/test actions
- functional TEST_LINK wiring
- functional SAVE_CONFIG wiring

### Settings / Extensions

- real schema-backed extension settings forms
- extension-settings persistence through the runtime configuration store
- extension manager settings section registration
- multiline string support
- numeric constraints
- multiselect UI
- bundled schema propagation for first-party settings sections

## What this checkpoint implements

The active checkpoint now includes:

- `DataSettingsPanel` for export/restore/version surfaces
- `GitSettingsPanel` for Git auth/provider/repository controls
- `restoreProjectData()` in the file manager
- `restoreData()`, `handleGitConfigUpdate()`, `handleGitConfigSave()`, `refreshGitRepositories()`, and `testGitLink()` in the app controller
- `authMode` and `patToken` in the project Git config model
- a normalized Git provider/repository helper service
- store-backed extension settings rendering in `SettingsView`
- a materially expanded `SettingsSchemaRenderer` with multiline, numeric, multiselect, and JSON handling
- extension registration-sink schema propagation
- first-party bundled settings-section schema registration for:
  - extension manager
  - Theme Studio
  - Gemini Agent

## Executed evidence in this checkpoint

The following commands were executed in the checkpoint zip:

- `node apps/client/tests/phase8-settings-data-git-parity.mjs --json`
- `node tools/conformance/generate-phase8-settings-data-git-checkpoint.mjs`

Recorded outputs:

- `artifacts/conformance/latest/phase-8-settings-data-git-node-results.json`
- `artifacts/conformance/latest/phase-8-settings-data-git-results.json`
- `artifacts/conformance/latest/phase-8-settings-data-git-checkpoint.json`
- `artifacts/conformance/latest/phase-8-settings-data-git-output.txt`

## Recorded results

This checkpoint records:

- 34/34 executable Phase 8 parity checks passing
- 31/31 structural Phase 8 audit checks passing

## Package/version state touched in this checkpoint

- `@mdwrk/mdwrkspace@1.4.0`
- `@mdwrk/i18n@1.1.0`
- `@mdwrk/extension-manager@1.1.0`
- `@mdwrk/extension-theme-studio@1.1.0`
- `@mdwrk/extension-gemini-agent@1.1.0`

The checkpoint also updates the node-module copies present in the provided zip so the settings-schema lane does not remain split between package source and installed package copies.

## Limits of this checkpoint

This Phase 8 checkpoint still does **not** close:

- theme exposure parity
- visible language selection and broader i18n parity
- final frozen-target CommonMark/GFM corpus closure
- browser/visual/publish evidence closure
- refreshed bundled extension publication artifacts on a new released version line

## Certification statement for this phase

This phase is a real and useful checkpoint, but it is still not sufficient to claim that the repository is:

- certifiably fully featured
- repository-internally RFC compliant across the full frozen boundary
- fully Markdown spec compliant across the full frozen CommonMark/GFM target
