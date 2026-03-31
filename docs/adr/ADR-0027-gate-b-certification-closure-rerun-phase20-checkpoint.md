# ADR-0027: Gate B certification-closure rerun (Phase 20 checkpoint)

Date: 2026-03-31
Status: accepted for the current checkpoint zip

## Context

Gate B remains the real final-closure path for certification from RC artifacts.

After Phase 19, the blocked certification items were still:

- official CommonMark corpus lane
- official GFM corpus lane
- browser matrix
- browser-driven visual regression
- full release-set packed tarball install
- the hard markdown closure rule derived from the official corpus lanes

## Decision

This checkpoint reruns the current closure evidence from the existing RC.1 line and records which blocked lanes can now be honestly moved to green in the current environment.

The repository now records:

- CommonMark official: `434/652` passing
- GFM official: `444/672` passing
- optional-profile lane: `8/8` passing
- browser-driven visual regression: green at `12/12` Chromium screenshot-diff checks
- full release-set packed tarball install: green with `17` tarballs validated together

The full browser matrix remains blocked and the official CommonMark/GFM lanes remain blocked.

## Consequences

This checkpoint materially improves the Gate B evidence bundle, but it is still **not** a certification checkpoint.

The remaining required work is still:

- reduce the official CommonMark failure count to zero
- reduce the official GFM failure count to zero
- execute the full required browser matrix in a real browser-capable environment with Chromium, Firefox, and WebKit available
- only then re-evaluate the hard markdown closure rule and the certification gate checklist

A further consequence is that the workspace was **not** re-versioned to a new RC line in this environment. The tarballs in this checkpoint were regenerated from the current RC.1 workspace state, but no semver bump or fresh RC cut was recorded.
