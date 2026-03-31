# Phase 20 release notes draft

Date: 2026-03-31T05:51:40.818Z
Workspace root version: 0.2.0-rc.1

## Summary

This checkpoint regenerates the Gate B evidence bundle from the current workspace state on top of the existing RC.1 line.

No new semver RC cut was performed in this environment. Tarballs were regenerated from the current workspace and validated locally, but the workspace versions remain on the existing RC.1 line.

## What materially advanced

- browser-rendered visual regression is now green in this environment (12/12 Chromium screenshot-diff checks)
- the full publishable release set now packs and installs successfully from local tarballs (17 tarballs)
- shell parity, settings/data/Git parity, preview/export, theme parity, i18n, package evidence, and editor smoke reruns all remained green

## What is still blocked

- official CommonMark corpus lane: 434/652 passing, 218 failing
- official GFM corpus lane: 444/672 passing, 228 failing
- full browser matrix lane: blocked because Chromium app navigation is restricted in this environment and Firefox/WebKit binaries are unavailable
- hard markdown closure rule: blocked because the official corpus lanes still fail

## Honest certification statement

This checkpoint does **not** authorize a final certification claim.

The strongest honest statement supported by the current evidence is:

- repository-internal feature and parity evidence is strong across the non-markdown closure lanes;
- browser-driven visual regression and full release-set tarball install are now green in this environment;
- the repository is **not yet** certifiably fully featured and **not yet** fully markdown spec compliant for the full frozen CommonMark/GFM target because the official corpus lanes and the full browser matrix are still blocked.
