# ADR-1024: ADR-0024 — Gate B certification-closure rerun checkpoint

# ADR-0024 — Gate B certification-closure rerun checkpoint

Date: 2026-03-30
Status: accepted for the current checkpoint zip

## Context

Phase 16 separated certification from promotion.
That policy correction left a narrow Gate B problem statement:

- rerun the blocked certification lanes from RC artifacts in a real execution environment;
- replace subset-only corpus evidence with full official corpus evidence; and
- measure the hard markdown closure rule against real official results rather than against incomplete audit language.

Before this checkpoint, the repository still relied on:

- subset CommonMark/GFM evidence;
- blocked browser-matrix and visual-regression lanes without concrete execution scaffolding; and
- a blocked hard markdown closure rule without official full-corpus failure counts recorded inside the repo.

## Decision

This checkpoint adds a **Gate B rerun checkpoint** rather than claiming final closure.

### The repository now carries full official corpus execution lanes

The repo now includes executable official-corpus lanes for:

- CommonMark 0.31.2
- GFM 0.29-gfm

These lanes are authoritative for Gate B.
Subset lanes remain useful for checkpoint history, but they are no longer enough for the hard markdown closure rule.

### Real browser execution remains Playwright-first

The repository now records Playwright Test scaffolding as the canonical browser-matrix/visual-regression runner for the blocked real-browser lanes.
This checkpoint does not pretend those lanes are green in the current environment.
It records them as blocked and explains why.

### Full release-set packed install remains a separate blocked Gate B lane

The repository now records a blocked full packed-tarball install attempt for the release set and preserves the current failure mode as evidence.

## Consequences

### Positive

- the hard markdown closure rule is now evaluated against real official corpus results
- the remaining Gate B blockers are now concrete and measurable
- browser/visual/install blockers are preserved as explicit evidence instead of being implicit placeholders

### Negative / remaining blockers

This checkpoint does **not** close certification because:

- the full official CommonMark lane still fails (`292` failures)
- the full official GFM lane still fails (`302` failures)
- the browser matrix lane remains blocked
- the browser-driven visual regression lane remains blocked
- the full release-set packed tarball install lane remains blocked

## Claim discipline

This checkpoint does **not** authorize a certification claim.
It only authorizes the narrower statement that Gate B has been rerun and the remaining certification blockers are now measured precisely.
