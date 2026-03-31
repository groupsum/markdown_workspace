# Phase 7 checkpoint summary

Date: 2026-03-28

This updated v2 zip is a **Phase 7 shell parity checkpoint** built on top of:

- the Phase 0 certification-target freeze;
- the Phase 1 release-train and compatibility-baseline freeze;
- the Phase 2 renderer/CommonMark-core checkpoint;
- the Phase 3 default-GFM checkpoint;
- the Phase 4 optional-profile checkpoint;
- the Phase 5 editor semantics and authoring UX checkpoint; and
- the Phase 6 preview/export/render-policy checkpoint.

## Phase 7 artifacts present in this checkpoint

- `docs/adr/ADR-0014-shell-parity-phase7-checkpoint.md`
- `docs/conformance/shell-parity-phase7.md`
- `docs/current-state/phase-7-shell-parity-assessment.md`
- `artifacts/conformance/latest/phase-7-shell-parity-checkpoint.json`
- `artifacts/conformance/latest/phase-7-shell-parity-results.json`
- `artifacts/conformance/latest/phase-7-shell-parity-node-results.json`
- `artifacts/conformance/latest/phase-7-shell-parity-output.txt`
- `tools/conformance/generate-phase7-shell-checkpoint.mjs`

## What this checkpoint materially adds

- `@mdwrk/mdwrkspace@1.4.0` now restores the v1-style status-bar runtime shell label, build identifier, and update-ready badge while keeping the registry-driven shell introduced by v2
- the action rail now restores the Import Markdown action as a real command and rail item, bridges it to a hidden shell file input, and imports `.md` / `.markdown` files into the active project through the existing file system layer
- the action-rail navigation surface now exposes a locale-driven `aria-label` and restores `aria-pressed` state on actionable buttons
- the client shell now exposes a reusable `splitViewPolicy` helper that restores the v1 mobile-landscape split-view allowance while keeping the stricter v2 package separation and responsive shell model
- the cloud-sync shell command again emits an explicit repository-refresh event instead of remaining a purely cosmetic action

## Evidence captured in this checkpoint

Executed evidence in this checkpoint includes:

- `node apps/client/tests/phase7-shell-parity.mjs --json`
- `node tools/conformance/generate-phase7-shell-checkpoint.mjs`

The generated artifacts record:

- 11/11 executable shell-parity checks passing
- 14/14 structural parity audit checks passing

## Honest current status

This checkpoint closes a meaningful **Phase 7 shell parity lane**.

It does **not** yet mean the repository is:

- certifiably fully featured
- repository-internally RFC compliant across the full frozen boundary
- fully Markdown spec compliant across the entire frozen CommonMark/GFM target

The main remaining reasons are:

- broader v1→v2 regression closures remain open outside this Phase 7 boundary, especially Git PAT parity, restore-from-JSON, theme exposure parity, language-selection parity, and extension-settings completion
- the provided checkpoint environment still does not contain the complete app/example toolchain surface needed for end-to-end browser-driven client test closure (`vitest` remains unavailable in the provided zip environment)
- frozen-target CommonMark/GFM corpus closure, browser/visual evidence, packed-artifact promotion evidence, and later release-candidate closures remain ahead of this phase

## Start here

- `docs/current-state/phase-7-shell-parity-assessment.md`
- `docs/conformance/shell-parity-phase7.md`
- `artifacts/conformance/latest/phase-7-shell-parity-checkpoint.json`
- `artifacts/conformance/latest/phase-7-shell-parity-results.json`
- `docs/conformance/current-certification-status.md`
