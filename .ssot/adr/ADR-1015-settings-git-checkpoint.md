# ADR-1015: ADR-0015 — Phase 8 settings, data, session, and Git parity checkpoint

# ADR-0015 — Phase 8 settings, data, session, and Git parity checkpoint

Date: 2026-03-28
Status: accepted for the current checkpoint zip

## Context

The v1→v2 audit established that the v2 shell architecture was stronger, but concrete end-user settings and repository-management functionality regressed.
The largest remaining parity band after Phase 7 was the settings/data/session/Git surface.

The material gaps were:

- restore-from-JSON remained stubbed
- secondary PWA version visibility inside settings was missing
- PAT-mode Git configuration and provider parity were missing
- TEST_LINK and SAVE_CONFIG were not functionally closed for the settings flow
- manual repository refresh behavior was missing from the Git settings surface
- extension settings sections still degraded into placeholders instead of true schema-backed forms
- multiline, numeric, and multiselect settings-schema rendering were incomplete

## Decision

This checkpoint accepts the following decisions.

### Settings/data/session/Git parity is now a named executable checkpoint lane

The repository now carries a Phase 8 checkpoint with explicit evidence for:

- restore workspace from JSON
- real restore-state flow in the active project
- retained IndexedDB export flow
- secondary PWA version visibility in settings
- PAT-vs-OIDC auth mode selection
- PAT provider selection, PAT token entry, and PAT readiness/status feedback
- provider normalization and PAT-backed repository inference/normalization behavior
- manual repository refresh support and refresh-event dispatch from Git settings actions
- functional TEST_LINK and SAVE_CONFIG settings actions
- retained session toggles for auto-save, restore-session, and line numbers

### Extension settings are no longer placeholder-only by policy

The client settings host now treats extension settings sections as real schema-backed forms whenever a schema is available.
That means:

- the extension registration sink must propagate the extension identifier and schema into the settings registry
- the settings view must obtain an extension configuration store from the extension runtime when rendering extension settings
- the schema renderer must support multiline strings, numeric constraints, multiselect fields, and JSON editing
- bundled extensions that declare settings sections must pass the schema through their bundled entry registration path

### Version-line movement in this checkpoint

The following packages materially expand in this checkpoint and therefore advance on their minor lines:

- `@mdwrk/i18n` → `1.1.0`
- `@mdwrk/extension-manager` → `1.1.0`
- `@mdwrk/extension-theme-studio` → `1.1.0`
- `@mdwrk/extension-gemini-agent` → `1.1.0`

`@mdwrk/mdwrkspace` remains on `1.4.0`, which was already advanced in the earlier Phase 5/7 checkpoint line.

## Consequences

### Positive

- the largest remaining v1→v2 settings parity band is substantially reduced
- restore/import/export behavior is materially less ambiguous for operators
- extension settings become materially usable instead of decorative
- Git configuration is now significantly closer to the declared provider/auth matrix
- the checkpoint zip now contains machine-readable evidence for the Phase 8 lane

### Remaining limits

This decision does **not** close:

- theme exposure parity
- visible language-selection parity and broader shell localization breadth
- final full frozen-target Markdown corpus closure
- full browser-driven client closure
- release-candidate, packed-artifact, promotion, and published-extension artifact refresh closures

## Evidence

This checkpoint is backed by:

- `node apps/client/tests/phase8-settings-data-git-parity.mjs --json`
- `node tools/conformance/generate-phase8-settings-data-git-checkpoint.mjs`

The machine-readable outputs are:

- `artifacts/conformance/latest/phase-8-settings-data-git-node-results.json`
- `artifacts/conformance/latest/phase-8-settings-data-git-results.json`
- `artifacts/conformance/latest/phase-8-settings-data-git-checkpoint.json`
