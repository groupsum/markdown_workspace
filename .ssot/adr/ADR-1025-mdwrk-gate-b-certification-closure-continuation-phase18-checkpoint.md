# ADR-1025: ADR-0025 — Gate B certification-closure continuation Phase 18 checkpoint

# ADR-0025 — Gate B certification-closure continuation Phase 18 checkpoint

Date: 2026-03-30
Status: accepted for the current checkpoint zip

## Context

Phase 17 converted the final Gate B blockers into measured blockers by adding executable full official CommonMark and GFM corpus lanes.

That checkpoint showed that the remaining certification blockers were no longer abstract. They were explicitly:

- the full official CommonMark corpus lane
- the full official GFM corpus lane
- the browser matrix lane
- the browser-driven visual regression lane
- the full release-set packed tarball install lane
- the hard markdown closure rule that depends on those corpus lanes reaching zero unresolved failures

The correct next move was therefore not to claim closure, but to continue improving the measured official Markdown lanes while preserving the already-green non-Markdown Gate B lanes.

## Decision

The Phase 18 checkpoint is treated as a **continuation checkpoint**, not a certification checkpoint.

It deliberately:

- advances the official CommonMark/GFM measured lanes with additional parser/renderer fixes;
- preserves the still-blocked real-environment lanes as blocked;
- refreshes the certification-gate evidence with the improved corpus counts; and
- avoids overstating closure.

## Consequences

### Positive

- the hard markdown blocker is narrower than it was in Phase 17
- the repo now has a better measured baseline for the remaining CommonMark/GFM work
- the browser/visual/install blockers remain explicit and unchanged, which keeps the certify-first policy coherent

### Still blocked

This checkpoint does **not** close certification because:

- CommonMark still fails in `248` official cases
- GFM still fails in `258` official cases
- the browser matrix lane is still blocked
- the browser-driven visual regression lane is still blocked
- the full release-set packed install lane is still blocked
- the hard markdown closure rule is therefore still blocked

## Claim discipline

This checkpoint does not authorize any broader claim than:

- the repository has made material progress on Gate B; and
- certification is still blocked.
