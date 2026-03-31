# Phase 10 checkpoint summary

Date: 2026-03-28

This updated v2 zip is a **Phase 10 i18n, language UX, and catalog coverage checkpoint** built on top of:

- the Phase 0 certification-target freeze;
- the Phase 1 release-train and compatibility-baseline freeze;
- the Phase 2 renderer/CommonMark-core checkpoint;
- the Phase 3 default-GFM checkpoint;
- the Phase 4 optional-profile checkpoint;
- the Phase 5 editor semantics and authoring UX checkpoint;
- the Phase 6 preview/export/render-policy checkpoint;
- the Phase 7 shell parity checkpoint;
- the Phase 8 settings/data/session/Git parity checkpoint; and
- the Phase 9 theme inventory/token contract/visual parity checkpoint.

## Phase 10 artifacts present in this checkpoint

- `docs/adr/ADR-0017-i18n-language-ux-and-catalog-coverage-phase10-checkpoint.md`
- `docs/conformance/i18n-language-phase10.md`
- `docs/current-state/phase-10-i18n-language-assessment.md`
- `artifacts/conformance/latest/phase-10-i18n-checkpoint.json`
- `artifacts/conformance/latest/phase-10-i18n-results.json`
- `artifacts/conformance/latest/phase-10-i18n-parity-node-results.json`
- `artifacts/conformance/latest/phase-10-i18n-parity-output.txt`
- `artifacts/conformance/latest/phase-10-i18n-test-output.txt`
- `tools/conformance/generate-phase10-i18n-checkpoint.mjs`
- `apps/client/tests/phase10-i18n-parity.mjs`

## What this checkpoint materially adds

- restores the shipped core shell locale inventory to **en, es, fr, pt, ur** through the shared `@mdwrk/i18n` package
- adds a visible language selector to settings and a compact optional selector to the project selector surface
- persists locale choice through the client i18n service and the host settings store
- broadens catalog-driven shell coverage across header, status bar, settings modal, data settings, Git settings, repository autocomplete, markdown-profile settings, and action-rail navigation
- keeps extension-specific catalogs in each bundled extension package while preserving schema-backed settings label formatting through the host formatter

## Evidence captured in this checkpoint

Executed evidence in this checkpoint includes:

- `npm run test -w @mdwrk/i18n`
- `node apps/client/tests/phase10-i18n-parity.mjs --json`
- `node tools/conformance/generate-phase10-i18n-checkpoint.mjs`

The generated artifacts record:

- 23/23 executable Phase 10 i18n parity checks passing
- 26/26 structural Phase 10 i18n/language UX audit checks passing

## Honest current status

This checkpoint closes a meaningful **Phase 10 i18n, language UX, and catalog coverage lane**.

It does **not** yet mean the repository is:

- certifiably fully featured
- repository-internally RFC compliant across the full frozen boundary
- fully Markdown spec compliant across the full frozen CommonMark/GFM target

The main remaining reasons are:

- full translation breadth across every project-selector and modal string is still broader than the explicitly audited shell/settings/action-rail/header/status boundary for this checkpoint
- full frozen-target CommonMark/GFM corpus closure, browser-driven visual regression, packed-artifact install evidence, and promotion/release closure are still ahead of this checkpoint
- visible language selection is now restored, but the remaining parity bands still include locale-sensitive surfaces outside the audited Phase 10 boundary

## Start here

- `docs/current-state/phase-10-i18n-language-assessment.md`
- `docs/conformance/i18n-language-phase10.md`
- `artifacts/conformance/latest/phase-10-i18n-checkpoint.json`
- `artifacts/conformance/latest/phase-10-i18n-results.json`
- `docs/conformance/current-certification-status.md`
