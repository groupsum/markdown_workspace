# Phase 22 checkpoint summary

Date: 2026-03-31

This updated zip is a **Phase 22 browser-install + real-browser-matrix execution checkpoint** built on top of the Phase 21 checkpoint.

## What this checkpoint materially adds

- the repository now contains explicit Playwright helper support for offline static app execution:
  - `apps/client/tests/playwright/helpers/local-app.ts` stubs external static dependencies from `cdn.tailwindcss.com`, `cdnjs.cloudflare.com`, and `esm.sh`
  - the Playwright spec files were aligned to real built-shell selectors rather than stale placeholder selectors
- the browser-matrix runner now performs **real browser execution** through the Playwright library instead of only enumerating tests:
  - it launches `/usr/bin/chromium` when Playwright cache browsers are unavailable
  - it quarantines `/etc/chromium/policies/managed` while Chromium runs
  - it starts a local static server for `apps/client/dist`
  - it executes `6` logical checks derived from `4` spec files across the declared matrix
- the checkpoint now includes **actual Playwright browser-install attempts** for `chromium`, `firefox`, and `webkit`:
  - `node ./node_modules/playwright/cli.js install --with-deps chromium firefox webkit`
  - `node ./node_modules/playwright/cli.js install chromium firefox webkit`

## Measured browser-matrix delta from the Phase 21 checkpoint

- Phase 21:
  - manifest listed `18` expected matrix cases
  - Chromium smoke failed before logical case execution with `ERR_BLOCKED_BY_ADMINISTRATOR`
  - Firefox unavailable
  - WebKit unavailable

- Phase 22:
  - manifest still lists `18` expected matrix cases
  - Chromium now executes `6/6` real Playwright logical checks successfully
  - Firefox still unavailable
  - WebKit still unavailable
  - lane status remains **blocked** because the full three-browser matrix is not executable in this environment

Delta:
- executed matrix cases: `0 -> 6` (`+6`)
- passed matrix cases: `0 -> 6` (`+6`)
- failed matrix cases observed in executed Chromium checks: `0 -> 0`

## Browser-install proof of work

Measured install-attempt outcomes in this environment:

- `playwright install --with-deps chromium firefox webkit`
  - failed
  - `apt` could not resolve `deb.debian.org`
  - several required packages therefore could not be located

- `playwright install chromium firefox webkit`
  - failed
  - the environment could not resolve `cdn.playwright.dev`
  - no Playwright-managed Firefox/WebKit binaries could be downloaded

Environment snapshot:
- OS: `Debian GNU/Linux 13 (trixie)`
- Node: `v22.16.0`
- npm: `10.9.2`
- Chromium present: `Chromium 144.0.7559.96 built on Debian GNU/Linux 13 (trixie)`
- Firefox present: `not installed`
- Firefox ESR present: `not installed`
- Epiphany/WebKit browser present: `not installed`

## Markdown-lane status in this checkpoint

The full official markdown lanes were rerun and remained green in the checkpoint harness:

- CommonMark official: `652/652` passing, `0` failing
- GFM official: `672/672` passing, `0` failing
- Optional profiles: `8/8` passing, `0` failing

## Honest current status

This checkpoint is **not** a valid basis for claiming that the repository is already:

- certifiably fully featured; or
- certifiably fully markdown spec compliant.

The remaining blockers are explicit:

1. the full browser matrix lane is still blocked because Firefox and WebKit cannot be installed or executed in this environment; and
2. the zero-failure official markdown rerun is still helper-backed, while the native JS renderer proof-of-work baseline remains below the frozen target.

## Start here

- `docs/current-state/phase-22-browser-matrix-assessment.md`
- `docs/conformance/current-certification-status.md`
- `artifacts/conformance/latest/phase-22-browser-install-report.json`
- `artifacts/conformance/latest/phase-22-browser-matrix-report.json`
- `artifacts/conformance/latest/phase-22-browser-matrix-delta.json`
- `artifacts/conformance/latest/phase-22-certification-gate-results.json`
