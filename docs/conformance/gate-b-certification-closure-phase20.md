# Phase 20 — Gate B certification closure rerun

Date: 2026-03-31
Checkpoint type: executable rerun checkpoint under the certify-first policy

## Scope of this checkpoint

This checkpoint reruns the Gate B evidence from the current workspace state, refreshes the shell/settings/editor/preview/i18n/package evidence, closes the browser-driven visual regression lane in the current environment, and closes the full release-set packed tarball install lane from local tarballs.

## Executed evidence in this checkpoint

The following commands were executed successfully in the checkpoint zip:

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

## Measured results in Phase 20

- CommonMark official: `434/652` passing, `218` failing
- GFM official: `444/672` passing, `228` failing
- optional profiles: `8/8` passing
- shell parity rerun: `11/11` passing
- settings/data/Git parity rerun: `34/34` passing
- preview/export rerun: `5/5` passing
- theme parity rerun: `51/51` passing
- i18n rerun: `23/23` passing
- package evidence rerun: `5/5` passing
- editor smoke reruns: `17/17` passing
- visual regression rerun: `12/12` passing
- packed release-set install: `17` tarballs validated together

## Certification gate status in this checkpoint

Green lanes now include:

- claimed optional-profile lane
- editor keyboard lane
- toolbar/selection lane
- preview/export lane
- accessibility lane
- browser-driven visual regression lane
- full release-set packed tarball install lane
- extension activation/compatibility lane
- docs/contract-boundary lane

Blocked lanes still explicitly recorded:

- official CommonMark corpus lane
- official GFM corpus lane
- full browser matrix lane

Hard closure rules:

- green: `4/5`
- blocked: `1/5`

The single remaining blocked hard closure rule is still:

- `no unresolved P0 markdown conformance failures`

## Honest status

This checkpoint is a valid **Phase 20 Gate B rerun checkpoint**.
It materially improves the evidence bundle.
It is **not yet** a certification checkpoint and it is **not yet** a promotion checkpoint.
