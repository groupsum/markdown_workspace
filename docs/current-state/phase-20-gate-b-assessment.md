# Phase 20 Gate B assessment

Date: 2026-03-31
Checkpoint type: rerun checkpoint under the certify-first policy

## What this checkpoint completes

This checkpoint completes a current-state rerun of the executable Gate B evidence and closes two previously blocked non-markdown lanes in the current environment:

- browser-driven visual regression
- full release-set packed tarball install

It also refreshes the shell/settings/editor/preview/i18n/package evidence so the checkpoint no longer relies only on inherited older green artifacts for those surfaces.

## Executed evidence in this checkpoint

The following commands were run successfully in the checkpoint zip:

- `node packages/renderer/markdown-renderer-core/tests/commonmark-official-corpus.mjs --json`
- `node packages/renderer/markdown-renderer-core/tests/gfm-official-corpus.mjs --json`
- `node packages/renderer/markdown-renderer-core/tests/optional-profiles.mjs --json`
- `node apps/client/tests/phase6-preview-export-policy.mjs --json`
- `node apps/client/tests/phase7-shell-parity.mjs --json`
- `node apps/client/tests/phase8-settings-data-git-parity.mjs --json`
- `node apps/client/tests/phase9-theme-parity.mjs --json`
- `node apps/client/tests/phase10-i18n-parity.mjs --json`
- `node apps/client/tests/phase11-package-evidence.mjs --json`
- `node packages/editor/markdown-editor-core/tests/run-smoke.mjs --json`
- `node packages/editor/markdown-editor-react/tests/run-smoke.mjs --json`
- `npm run conformance`
- `node apps/client/tests/phase20-browser-visual-closure.mjs --json`
- `node tools/release/pack-workspaces.mjs`
- clean-directory local `npm install --ignore-scripts artifacts/packs/*.tgz`

## Current measured state

- CommonMark official remains blocked at `434/652` passing (`218` failing)
- GFM official remains blocked at `444/672` passing (`228` failing)
- optional profiles remain green at `8/8`
- the visual regression lane is green at `12/12`
- the packed release-set install lane is green with `17` tarballs validated together
- the full browser matrix lane remains blocked because Chromium app navigation is restricted in the current environment and Firefox/WebKit browser binaries are unavailable

## Why certification is still blocked

The remaining certification blockers are now exactly:

- the full official CommonMark lane
- the full official GFM lane
- the full browser matrix lane
- the hard markdown closure rule derived from the official corpus lanes

Everything else in the Gate B certification boundary is green in this checkpoint.

## Important release-note qualifier

Although this checkpoint includes code and evidence updates, it does **not** record a fresh semver RC cut. The tarballs were regenerated from the existing RC.1 workspace line and validated locally, but version numbers were not advanced to a new RC label in this environment.
