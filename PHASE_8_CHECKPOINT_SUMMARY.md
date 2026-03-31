# Phase 8 checkpoint summary

Date: 2026-03-28

This updated v2 zip is a **Phase 8 settings/data/session/Git parity checkpoint** built on top of:

- the Phase 0 certification-target freeze;
- the Phase 1 release-train and compatibility-baseline freeze;
- the Phase 2 renderer/CommonMark-core checkpoint;
- the Phase 3 default-GFM checkpoint;
- the Phase 4 optional-profile checkpoint;
- the Phase 5 editor semantics and authoring UX checkpoint;
- the Phase 6 preview/export/render-policy checkpoint; and
- the Phase 7 shell parity checkpoint.

## Phase 8 artifacts present in this checkpoint

- `docs/adr/ADR-0015-settings-data-git-parity-phase8-checkpoint.md`
- `docs/conformance/settings-data-git-phase8.md`
- `docs/current-state/phase-8-settings-data-git-assessment.md`
- `artifacts/conformance/latest/phase-8-settings-data-git-checkpoint.json`
- `artifacts/conformance/latest/phase-8-settings-data-git-results.json`
- `artifacts/conformance/latest/phase-8-settings-data-git-node-results.json`
- `artifacts/conformance/latest/phase-8-settings-data-git-output.txt`
- `tools/conformance/generate-phase8-settings-data-git-checkpoint.mjs`
- `apps/client/tests/phase8-settings-data-git-parity.mjs`

## What this checkpoint materially adds

- `@mdwrk/mdwrkspace@1.4.0` now restores the missing settings/data/Git parity lane with a real restore-from-JSON workflow, secondary PWA version visibility in settings, PAT-vs-OIDC auth mode selection, PAT provider/token/status surfaces, manual repository refresh, functional TEST_LINK and SAVE_CONFIG actions, and persisted project Git configuration normalization
- the client settings host now renders real schema-backed extension settings using the extension runtime configuration store instead of showing placeholder-only panels
- the schema renderer now supports multiline fields, numeric constraints, multiselect fields, and JSON editing with validation feedback
- the bundled extension packages now register real settings sections with schema propagation so the extension manager, Theme Studio, and Gemini settings surfaces are materially renderable through the host settings stack
- the package lines that materially expanded in this checkpoint now advance to the frozen Phase 8 versions included here:
  - `@mdwrk/i18n@1.1.0`
  - `@mdwrk/extension-manager@1.1.0`
  - `@mdwrk/extension-theme-studio@1.1.0`
  - `@mdwrk/extension-gemini-agent@1.1.0`

## Evidence captured in this checkpoint

Executed evidence in this checkpoint includes:

- `node apps/client/tests/phase8-settings-data-git-parity.mjs --json`
- `node tools/conformance/generate-phase8-settings-data-git-checkpoint.mjs`

The generated artifacts record:

- 34/34 executable Phase 8 parity checks passing
- 31/31 structural Phase 8 audit checks passing

## Honest current status

This checkpoint closes a meaningful **Phase 8 settings/data/session/Git parity lane**.

It does **not** yet mean the repository is:

- certifiably fully featured
- repository-internally RFC compliant across the full frozen boundary
- fully Markdown spec compliant across the entire frozen CommonMark/GFM target

The main remaining reasons are:

- theme exposure parity and visible language-selection parity are still open
- full frozen-target CommonMark/GFM corpus closure, browser/visual closure, packed-artifact release evidence, and later RC/promotion phases are still ahead of this checkpoint
- the provided zip environment still does not contain the complete browser-driven test dependency surface needed for final client-side Vitest/browser closure
- bundled extension publication artifacts under `artifacts/extensions/` have not been republished on a new released line in this checkpoint even though the source packages and node-module copies were updated for the settings lane

## Start here

- `docs/current-state/phase-8-settings-data-git-assessment.md`
- `docs/conformance/settings-data-git-phase8.md`
- `artifacts/conformance/latest/phase-8-settings-data-git-checkpoint.json`
- `artifacts/conformance/latest/phase-8-settings-data-git-results.json`
- `docs/conformance/current-certification-status.md`
