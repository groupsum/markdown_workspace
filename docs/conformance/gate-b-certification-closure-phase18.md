# Phase 18 — Gate B certification closure continuation

Date: 2026-03-30
Checkpoint type: continued official-corpus improvement under the certify-first policy

## Purpose

This checkpoint continues Gate B work after Phase 17.
Its purpose is not to claim closure.
Its purpose is to materially reduce the official CommonMark/GFM blocker counts while preserving the still-blocked non-Markdown lanes as blocked.

## What was rerun in this checkpoint

### Full official Markdown corpus lanes

The repository reran:

- the full official CommonMark 0.31.2 corpus
- the full official GFM 0.29-gfm corpus
- the claimed optional-profile lane

### Inherited green Gate B lanes retained

The repository retains green evidence for:

- editor keyboard
- toolbar/selection
- preview/export
- accessibility
- extension activation/compatibility
- docs/contract boundary

### Explicitly blocked lanes retained

The repository still records blocked state for:

- browser matrix
- browser-driven visual regression
- full release-set packed tarball install

## Recorded results

### Official CommonMark lane

- total: `652`
- passed: `404`
- failed: `248`
- delta from Phase 17: `+44` passing / `-44` failing

Artifact:
- `artifacts/conformance/latest/phase-18-commonmark-official-summary.json`

### Official GFM lane

- total: `672`
- passed: `414`
- failed: `258`
- delta from Phase 17: `+44` passing / `-44` failing

Artifact:
- `artifacts/conformance/latest/phase-18-gfm-official-summary.json`

### Claimed optional-profile lane

- total: `8`
- passed: `8`
- failed: `0`

Artifact:
- `artifacts/conformance/latest/phase-18-optional-profile-summary.json`

## Current blocked Gate B items

The blocked Gate B items remain:

- official CommonMark corpus lane
- official GFM corpus lane
- browser matrix lane
- browser-driven visual regression lane
- full release-set packed tarball install lane
- hard rule `no unresolved P0 markdown conformance failures`

## Gate state in this checkpoint

- `7/12` certification lanes green
- `5/12` certification lanes blocked
- `4/5` hard closure rules green
- `1/5` hard closure rules blocked

## Honest status

This checkpoint is a valid **Gate B continuation checkpoint**.
It is useful because it materially improves the measured Markdown blockers.
It does **not** certify the repository.
