# Phase 10 — i18n, language UX, and catalog coverage

Date: 2026-03-28
Checkpoint type: executable i18n/language-UX checkpoint

## Scope of this phase

This checkpoint closes the Phase 10 parity band identified by the v1→v2 audit:

- restore the shipped core locales `es`, `fr`, `pt`, and `ur`
- expose a visible language selector
- persist language choice
- broaden core shell catalog coverage across in-scope shell/settings surfaces
- keep extension-specific catalogs with extension packages rather than moving them into the core app

## Restored core locales

The shared `@mdwrk/i18n` package now ships core shell catalog support for:

- `en`
- `es`
- `fr`
- `pt`
- `ur`

Those locales are exported through `CORE_SHELL_SUPPORTED_LOCALES` and loaded through `CORE_SHELL_LOCALE_LOADER_DEFINITION`.

## Language UX restored in this checkpoint

The client now exposes:

- a visible **Language & Locale** settings section; and
- a compact optional language selector in the project-selector surface.

Locale choice is persisted in both:

- the client i18n local storage key `mdwrk.core.locale`; and
- the host settings store key `core.locale`.

## Catalog-driven shell coverage in this checkpoint

The audited Phase 10 shell/settings boundary now routes strings through i18n for:

- action-rail navigation aria-label
- header strings
- footer/status strings
- settings modal strings
- data settings strings
- Git settings strings
- OIDC selector strings
- repository autocomplete strings
- markdown profile settings strings
- core command and settings section titles registered through the runtime surface registry

## Extension catalog placement

This checkpoint preserves the architectural rule that:

- core shell catalogs belong in `@mdwrk/i18n` plus client registration; and
- extension-specific catalogs stay in extension packages.

Bundled extension locale catalogs remain in:

- `packages/extensions/extension-manager/src/locales/*`
- `packages/extensions/extension-theme-studio/src/locales/*`
- `packages/extensions/extension-gemini-agent/src/locales/*`

## Executed evidence in this checkpoint

The following commands were executed in the checkpoint zip:

- `npm run test -w @mdwrk/i18n`
- `node apps/client/tests/phase10-i18n-parity.mjs --json`
- `node tools/conformance/generate-phase10-i18n-checkpoint.mjs`

Recorded artifacts:

- `artifacts/conformance/latest/phase-10-i18n-checkpoint.json`
- `artifacts/conformance/latest/phase-10-i18n-results.json`
- `artifacts/conformance/latest/phase-10-i18n-parity-node-results.json`
- `artifacts/conformance/latest/phase-10-i18n-parity-output.txt`
- `artifacts/conformance/latest/phase-10-i18n-test-output.txt`

## Recorded results

This checkpoint records:

- 23/23 executable Phase 10 i18n parity checks passing
- 26/26 structural Phase 10 i18n/language UX audit checks passing

## What this checkpoint does not close

This checkpoint still does **not** close:

- full translation breadth across every project-selector and modal string outside the explicitly audited shell/settings boundary
- full frozen-target CommonMark/GFM corpus closure
- browser-driven visual regression closure
- packed-artifact install evidence and release promotion closure

## Certification statement for this phase

This Phase 10 checkpoint is a real and useful checkpoint.
It closes the i18n/language-UX/catalog-coverage lane identified by the audit.

It does **not** yet authorize the repository to claim that it is:

- certifiably fully featured
- repository-internally RFC compliant across the full frozen boundary
- fully Markdown spec compliant across the full frozen CommonMark/GFM target
