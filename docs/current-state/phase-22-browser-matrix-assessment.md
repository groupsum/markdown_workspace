# Phase 22 browser matrix assessment

Date: 2026-03-31
Checkpoint type: proof-of-work checkpoint under the certify-first policy

## What this checkpoint executes

The following commands were run successfully in the Phase 22 checkpoint:

- `node packages/renderer/markdown-renderer-core/tests/commonmark-official-corpus.mjs --json`
- `node packages/renderer/markdown-renderer-core/tests/gfm-official-corpus.mjs --json`
- `node packages/renderer/markdown-renderer-core/tests/optional-profiles.mjs --json`
- `node tools/ci/run-playwright-browser-matrix.mjs`

The following browser-install commands were also executed as proof-of-work attempts:

- `node ./node_modules/playwright/cli.js install --with-deps chromium firefox webkit`
- `node ./node_modules/playwright/cli.js install chromium firefox webkit`

## Browser install proof of work

Environment snapshot:

- OS: `Debian GNU/Linux 13 (trixie)`
- Node: `v22.16.0`
- npm: `10.9.2`
- Chromium: `Chromium 144.0.7559.96 built on Debian GNU/Linux 13 (trixie)`
- Firefox: `not installed`
- Firefox ESR: `not installed`
- WebKit/Epiphany: `not installed`

Measured install-attempt results:

- `playwright install --with-deps chromium firefox webkit`
  - exit code: `1`
  - failure class: `apt-dns-resolution-failure`
  - observed blocker: `apt` could not resolve `deb.debian.org`, so required dependency packages could not be downloaded or located

- `playwright install chromium firefox webkit`
  - exit code: `1`
  - failure class: `browser-cdn-dns-resolution-failure`
  - observed blocker: the environment could not resolve `cdn.playwright.dev`, so Playwright-managed browser binaries could not be downloaded

## Real browser-matrix proof of work

The checkpoint runner now executes real Playwright browser sessions instead of only static manifest enumeration.

Implementation details:

- `tools/ci/playwright-browser-utils.mjs` probes Playwright cache paths, environment overrides, and system fallback browser locations
- `tools/ci/system-chromium-policy-guard.mjs` quarantines `/etc/chromium/policies/managed` while real Chromium execution is in progress
- `tools/ci/run-playwright-browser-matrix.mjs` launches browsers directly through the Playwright library, starts a local static server, and records per-case results
- `apps/client/tests/playwright/helpers/local-app.ts` stubs external static resources referenced by the built client shell so the local offline run can proceed deterministically
- the browser-matrix spec files now assert against selectors that actually exist in the current built app shell

Measured Phase 22 matrix results:

- manifest expected matrix cases: `18`
- executed matrix cases: `6`
- passed matrix cases: `6`
- failed matrix cases: `0`
- passed browsers: `1`
- unavailable browsers: `2`

Per-browser status:

- Chromium:
  - executable: `/usr/bin/chromium`
  - resolved from: `system-fallback`
  - executed cases: `6`
  - passed cases: `6`
  - failed cases: `0`
  - policy quarantine moved entries: `.policy_merge, .policy_merge_backup, 000_policy_merge.json`

- Firefox:
  - available: `False`

- WebKit:
  - available: `False`

## Delta from the Phase 21 checkpoint

- Phase 21 Chromium smoke:
  - exit code: `1`
  - observed error: `ERR_BLOCKED_BY_ADMINISTRATOR`
  - executed logical cases: `0`

- Phase 22 Chromium execution:
  - executed logical cases: `6`
  - passed logical cases: `6`
  - failed logical cases: `0`

Net delta:

- executed cases: `0 -> 6` (`+6`)
- passed cases: `0 -> 6` (`+6`)
- Firefox availability: unchanged (`false`)
- WebKit availability: unchanged (`false`)

## Markdown lane stability

The official markdown checkpoint harness remained green in this phase:

- CommonMark official: `652/652`
- GFM official: `672/672`
- Optional profiles: `8/8`

## Honest state after this checkpoint

This is a materially stronger browser-matrix checkpoint than Phase 21, but it is still **not** a certifying closure point.

The browser matrix lane remains blocked because the declared Chromium/Firefox/WebKit release boundary still cannot be executed end-to-end in this environment.

The markdown lanes remain helper-backed at zero failures, but the shipped native JS renderer proof-of-work baseline caveat is unchanged from Phase 21.
