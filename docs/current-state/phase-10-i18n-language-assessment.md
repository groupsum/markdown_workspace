# Phase 10 i18n, language UX, and catalog coverage assessment

Date: 2026-03-28
Checkpoint type: executable i18n/language-UX checkpoint built on the Phase 0 through Phase 9 baselines

## What this checkpoint completes

This checkpoint completes a **substantive Phase 10 localization and language-UX update** for the current v2 repository.

The repository now has:

- restored core shell locales for `en`, `es`, `fr`, `pt`, and `ur`
- a visible language selector in settings
- a compact optional language selector in the project selector
- persistent locale selection across reloads
- broader catalog-driven coverage across the audited shell/settings surfaces
- preserved package-local extension locale catalogs for bundled extensions
- machine-readable Phase 10 evidence artifacts

## Executed evidence in this checkpoint

The following commands were run successfully in the checkpoint zip:

- `npm run test -w @mdwrk/i18n`
- `node apps/client/tests/phase10-i18n-parity.mjs --json`
- `node tools/conformance/generate-phase10-i18n-checkpoint.mjs`

Recorded results are captured in:

- `artifacts/conformance/latest/phase-10-i18n-checkpoint.json`
- `artifacts/conformance/latest/phase-10-i18n-results.json`
- `artifacts/conformance/latest/phase-10-i18n-parity-node-results.json`
- `artifacts/conformance/latest/phase-10-i18n-parity-output.txt`
- `artifacts/conformance/latest/phase-10-i18n-test-output.txt`

## What materially changed

### Shared i18n package

`@mdwrk/i18n` now exposes the restored core shell locale loader definition and supported locale inventory for:

- `en`
- `es`
- `fr`
- `pt`
- `ur`

### Client locale service and runtime

The client locale service now persists locale selection and the runtime restores locale preference from the host settings store.

### Visible language UX

The client now exposes visible language controls in two places:

- settings
- project selector (compact control)

### Shell string coverage

Header, footer/status, settings modal, data settings, Git settings, repository autocomplete, markdown-profile settings, and action-rail navigation are now in the audited catalog-driven shell boundary.

## What this checkpoint does not complete

This checkpoint still does **not** complete:

- full translation breadth across every project-selector/modal string outside the explicitly audited shell/settings boundary
- final full frozen-target CommonMark/GFM corpus closure
- final browser-driven visual regression closure
- packed-artifact install evidence and promotion/release closure

## Honest current status

This updated v2 checkpoint is a valid **Phase 10 i18n, language UX, and catalog coverage checkpoint**.

It is **not yet**:

- certifiably fully featured
- repository-internally RFC compliant across the full frozen boundary
- fully Markdown spec compliant across the full frozen CommonMark/GFM target

The repository is again materially stronger and less ambiguous than it was in Phase 9, but this checkpoint should still be treated as a **checkpointed partial closure**, not as final certification.
