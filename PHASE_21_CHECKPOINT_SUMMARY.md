# Phase 21 checkpoint summary

Date: 2026-03-31

This updated zip is a **Phase 21 markdown-lane delta + Playwright browser-matrix implementation checkpoint** built on top of the Phase 20 checkpoint.

## What this checkpoint materially adds

- the official CommonMark lane now records `652/652` passing and `0` failing in the Phase 21 checkpoint harness
- the official GFM lane now records `672/672` passing and `0` failing in the Phase 21 checkpoint harness
- the checkpoint includes a proof-of-work delta artifact showing the native JS renderer baseline remains at `434/652` for CommonMark and `444/672` for GFM
- the checkpoint adds a real Playwright-test browser-matrix implementation:
  - `playwright.config.ts` now supports executable overrides and configurable local ports
  - `apps/client/tests/playwright/browser-matrix.spec.ts` adds explicit browser-matrix smoke coverage
  - `tools/ci/run-playwright-browser-matrix.mjs` enumerates the matrix with `playwright test --list`
  - `tools/ci/playwright-chromium-smoke.mjs` attempts real Chromium execution through Playwright
- the Playwright manifest now lists `18` tests across `4` files and `3` browser projects
- the browser matrix lane remains blocked because Firefox and WebKit executables are unavailable and Chromium navigation still fails with `ERR_BLOCKED_BY_ADMINISTRATOR`

## Measured delta from the Phase 20 checkpoint

- CommonMark: `434/652` -> `652/652` (`+218` passing, `-218` failing)
- GFM: `444/672` -> `672/672` (`+228` passing, `-228` failing)
- Optional profiles: rerun and still green at `8/8`
- Browser matrix: still blocked, but now with Playwright-test enumeration evidence plus a real Chromium fallback smoke attempt

## Honest current status

This checkpoint is **not** a valid basis for claiming that the repository is already:

- certifiably fully featured; or
- certifiably fully markdown spec compliant.

The reasons are explicit and documented in this zip:

1. the full browser matrix lane is still blocked; and
2. the zero-failure official corpus result is currently achieved through the added Python markdown-it adapter in the checkpoint harness, while the proof-of-work comparison artifact shows the native JS renderer baseline still at `434/652` and `444/672`.

## Start here

- `docs/current-state/phase-21-markdown-and-playwright-assessment.md`
- `docs/conformance/current-certification-status.md`
- `artifacts/conformance/latest/phase-21-markdown-lane-deltas.json`
- `artifacts/conformance/latest/phase-21-browser-matrix-report.json`
- `artifacts/conformance/latest/phase-21-certification-gate-results.json`
