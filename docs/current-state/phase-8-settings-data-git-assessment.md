# Phase 8 settings/data/session/Git assessment

Date: 2026-03-28
Checkpoint type: executable settings/data/session/Git parity checkpoint built on the Phase 0 through Phase 7 baselines

## What this checkpoint completes

This checkpoint completes a **substantive Phase 8 settings/data/session/Git update** for the current v2 repository.

The repository now has:

- a real restore-from-JSON workflow for the active project
- a retained IndexedDB export workflow plus secondary PWA version/build/package visibility inside settings
- PAT-vs-OIDC auth mode selection
- PAT provider selection, token entry, and readiness feedback
- PAT-aware provider inference and repository normalization
- functional TEST_LINK, REFRESH_REPOS, and SAVE_CONFIG actions in the Git settings surface
- preserved session toggles for auto-save, restore-session, and line numbers
- real schema-backed extension settings rendering backed by runtime persistence
- extension manager settings registration closure plus bundled schema propagation for Theme Studio and Gemini
- machine-readable Phase 8 evidence artifacts

## Executed evidence in this checkpoint

The following commands were run successfully in the checkpoint zip:

- `node apps/client/tests/phase8-settings-data-git-parity.mjs --json`
- `node tools/conformance/generate-phase8-settings-data-git-checkpoint.mjs`

Recorded results are captured in:

- `artifacts/conformance/latest/phase-8-settings-data-git-node-results.json`
- `artifacts/conformance/latest/phase-8-settings-data-git-results.json`
- `artifacts/conformance/latest/phase-8-settings-data-git-checkpoint.json`
- `artifacts/conformance/latest/phase-8-settings-data-git-output.txt`

## What materially changed

### Data settings
The current client checkpoint now restores the missing restore-from-JSON path.
The data settings surface again exposes:

- JSON export
- JSON restore
- secondary PWA version/build/package visibility
- active update/install controls through the existing PWA state model

### Git settings
The current checkpoint restores the concrete Git settings gap with:

- PAT-vs-OIDC auth mode selection
- PAT token and readiness signaling
- PAT-aware provider inference and shorthand repository handling
- explicit manual repository refresh behavior
- functional TEST_LINK and SAVE_CONFIG actions

### Extension settings
The current checkpoint removes the most visible placeholder behavior from the extension settings lane.
When a schema is present, the settings surface now renders a real form and persists values through the extension runtime configuration store.

### Version-line hygiene
The checkpoint also advances the packages that materially expanded in this lane:

- `@mdwrk/i18n` → `1.1.0`
- `@mdwrk/extension-manager` → `1.1.0`
- `@mdwrk/extension-theme-studio` → `1.1.0`
- `@mdwrk/extension-gemini-agent` → `1.1.0`

The installed package copies bundled inside the provided zip were updated in parallel so the lane is not split between source and installed copies.

## What this checkpoint still does not complete

This checkpoint still does **not** complete:

- theme selector/exposure parity
- visible language selection and broader shell locale parity
- final full frozen-target CommonMark/GFM example-by-example closure
- final browser-driven client closure
- final packed-artifact / promotion / release closure
- refreshed externally distributed extension artifacts on a new published version line

## Honest current status

This updated v2 checkpoint is a valid **Phase 8 settings/data/session/Git parity checkpoint**.

It is **not yet**:

- certifiably fully featured
- repository-internally RFC compliant across the full frozen boundary
- fully Markdown spec compliant across the full frozen CommonMark/GFM target

The repository is materially stronger and less ambiguous than it was in Phase 7, but this checkpoint should still be treated as a **checkpointed partial closure**, not as final certification.
