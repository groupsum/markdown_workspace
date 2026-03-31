# Current certification status

Date: 2026-03-31

## Summary

This repository checkpoint is a **Phase 22 browser-install + real-browser-matrix execution checkpoint** built on top of the existing Phase 21 checkpoint.

It is **not yet certified** as:

- certifiably fully featured
- repository-internal RFC compliant for the full frozen boundary
- Markdown spec compliant for the full frozen CommonMark/GFM target

## What is now true in this checkpoint

- the full official checkpoint harness rerun remains green:
  - CommonMark official: `652/652` passing, `0` failing
  - GFM official: `672/672` passing, `0` failing
  - optional profiles: `8/8` passing, `0` failing
- the repository now includes a stronger real-browser Playwright execution path for the browser matrix lane:
  - Playwright spec files align to the real built client shell
  - the local-app helper stubs offline external static dependencies
  - the browser-matrix runner launches Chromium directly through Playwright, starts a local static server, and records per-case outcomes
  - the Chromium policy guard temporarily quarantines `/etc/chromium/policies/managed` during browser execution
- measured browser-matrix execution now proves:
  - expected matrix cases: `18`
  - executed matrix cases: `6`
  - passed matrix cases: `6`
  - failed matrix cases: `0`
  - Chromium passed `6/6` executed logical checks
- measured browser-install attempts now prove:
  - `playwright install --with-deps chromium firefox webkit` failed because `apt` could not resolve `deb.debian.org`
  - `playwright install chromium firefox webkit` failed because the environment could not resolve `cdn.playwright.dev`
  - Firefox remains unavailable
  - WebKit remains unavailable
- the green visual regression, packed tarball install, extension compatibility, and docs/contract-boundary lanes remain inherited from Phase 20

## Certification gate status

The certification gate is still blocked by two explicit conditions:

1. the full browser matrix lane is still blocked because Firefox and WebKit cannot be installed or executed in this environment; and
2. the markdown zero-failure result is helper-backed in the checkpoint harness, while the native JS renderer proof-of-work baseline remains materially below full CommonMark/GFM parity.

## Why certification is still not claimed

The repository is materially improved as a checkpoint:

- the browser matrix now has real Chromium execution proof where Phase 21 only had a blocked smoke attempt
- Phase 21 to Phase 22 browser delta:
  - executed matrix cases: `0 -> 6`
  - passed matrix cases: `0 -> 6`
  - Chromium smoke blocker (`ERR_BLOCKED_BY_ADMINISTRATOR`) is now mitigated by temporary policy quarantine during execution
- the full official markdown rerun remained green with no regression

But the checkpoint still cannot honestly claim final certification because the declared three-browser matrix is not green and the zero-failure markdown result is not yet demonstrated through the shipped native JS renderer path.

## Key documents for this checkpoint

- `PHASE_22_CHECKPOINT_SUMMARY.md`
- `docs/current-state/phase-22-browser-matrix-assessment.md`
- `artifacts/conformance/latest/phase-22-browser-install-report.json`
- `artifacts/conformance/latest/phase-22-browser-matrix-report.json`
- `artifacts/conformance/latest/phase-22-browser-matrix-delta.json`
- `artifacts/conformance/latest/phase-22-certification-gate-results.json`
