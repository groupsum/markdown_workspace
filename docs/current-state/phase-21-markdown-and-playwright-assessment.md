# Phase 21 markdown and Playwright assessment

Date: 2026-03-31
Checkpoint type: proof-of-work checkpoint under the certify-first policy

## What this checkpoint executes

The following commands were run successfully in the Phase 21 checkpoint:

- `node packages/renderer/markdown-renderer-core/tests/commonmark-official-corpus.mjs --json`
- `node packages/renderer/markdown-renderer-core/tests/gfm-official-corpus.mjs --json`
- `node packages/renderer/markdown-renderer-core/tests/optional-profiles.mjs --json`
- `node tools/conformance/phase-21-markdown-lane-deltas.mjs`
- `node tools/ci/run-playwright-browser-matrix.mjs`

## Markdown-lane proof of work

The checkpoint includes two separate measurements on the same repository state:

1. the native JS renderer baseline; and
2. the new official-lane adapter-backed checkpoint harness.

Measured results:

- CommonMark native JS renderer baseline: `434/652` passing, `218` failing
- CommonMark checkpoint harness: `652/652` passing, `0` failing
- CommonMark delta: `+218` passing, `-218` failing, `218` previously failing case ids resolved in the harness

- GFM native JS renderer baseline: `444/672` passing, `228` failing
- GFM checkpoint harness: `672/672` passing, `0` failing
- GFM delta: `+228` passing, `-228` failing, `228` previously failing case ids resolved in the harness

The full resolved-failure id lists and section counts are recorded in `artifacts/conformance/latest/phase-21-markdown-lane-deltas.json`.

## Browser-matrix proof of work

The checkpoint adds and executes a real Playwright support path for the browser matrix lane:

- `playwright.config.ts` now accepts executable overrides and configurable ports
- `apps/client/tests/playwright/browser-matrix.spec.ts` adds dedicated browser-matrix tests
- `tools/ci/run-playwright-browser-matrix.mjs` enumerates the matrix through `playwright test --list`
- `tools/ci/playwright-chromium-smoke.mjs` performs a real Chromium navigation attempt through Playwright using a system-browser fallback when available

Measured results:

- `playwright test --list` succeeded with exit code `0`
- the manifest lists `18` tests across `4` files and `3` browser projects
- Chromium resolved to `/usr/bin/chromium` via a system fallback
- Firefox remained unavailable
- WebKit remained unavailable
- the Chromium smoke attempt failed with `ERR_BLOCKED_BY_ADMINISTRATOR` while navigating the local app URL

## Honest state of the repository after this checkpoint

This checkpoint is useful and materially improved, but it is still **not** a certifying closure point.

The official corpus numbers are now fully green in the adapter-backed checkpoint harness, but the native JS renderer proof-of-work baseline remains below the frozen CommonMark/GFM target.

The browser matrix is now concretely wired with Playwright, but the lane remains blocked in the current environment.
