# Phase 17 — Gate B certification closure rerun

Date: 2026-03-30
Checkpoint type: full-corpus and blocked-lane measurement checkpoint

## Purpose

This checkpoint executes the first serious Gate B rerun under the Phase 16 certify-first policy.
Its purpose is not to claim closure.
Its purpose is to replace vague blockers with measured blockers.

## What was rerun in this checkpoint

### Full official Markdown corpus lanes

The repository now executes:

- the full official CommonMark 0.31.2 corpus
- the full official GFM 0.29-gfm corpus
- the claimed optional-profile lane

### Existing green lanes retained from earlier checkpoints

The repository continues to carry green evidence for:

- editor keyboard
- toolbar/selection
- preview/export
- accessibility
- extension activation/compatibility
- docs/contract boundary

### Blocked lanes measured again

This checkpoint also records the current blocked state for:

- browser matrix
- browser-driven visual regression
- full release-set packed tarball install

## Recorded results

### Official CommonMark lane

- total: `652`
- passed: `360`
- failed: `292`

Artifact:
- `artifacts/conformance/latest/phase-17-commonmark-official-summary.json`

### Official GFM lane

- total: `672`
- passed: `370`
- failed: `302`

Artifact:
- `artifacts/conformance/latest/phase-17-gfm-official-summary.json`

### Claimed optional-profile lane

- total: `8`
- passed: `8`
- failed: `0`

Artifact:
- `artifacts/conformance/latest/phase-17-optional-profile-summary.json`

## Current blocked Gate B items

The blocked Gate B items are now explicit:

- official CommonMark corpus lane
- official GFM corpus lane
- browser matrix lane
- browser-driven visual regression lane
- full release-set packed tarball install lane
- hard rule `no unresolved P0 markdown conformance failures`

## What this means

The certification gate is still **not green**.

The Gate B result is now:

- `7/12` lanes green
- `5/12` lanes blocked
- `4/5` hard closure rules green
- `1/5` hard closure rules blocked

## Why this still matters

This checkpoint is still valuable because it converts the final blocking state from “remaining work exists” into exact measurable deltas.
The repo now knows the real official-corpus failure counts and no longer needs to rely on subset-only closure language.

## Honest status

This checkpoint is a valid **Gate B certification-closure rerun checkpoint**.
It does **not** certify the repository.
