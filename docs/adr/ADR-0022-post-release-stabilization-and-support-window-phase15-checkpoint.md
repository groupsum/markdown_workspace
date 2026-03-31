# ADR-0022 — Phase 15 post-release stabilization and support-window checkpoint

Date: 2026-03-30
Status: accepted for the current checkpoint zip

## Context

Phase 14 produced a promotion/release bundle but did **not** produce a real public release.
That left a maturity gap:

- there was no explicit short support-window policy
- there was no explicit patch-only acceptance rule on the prepared train
- there was no stabilization monitoring matrix for extension activation, theme, and i18n regressions
- the evidence chain from Phases 12 through 14 was not yet preserved under a dedicated immutable support-window manifest
- the repository still needed a final checklist that showed why a broad success claim remained unavailable

## Decision

The Phase 15 checkpoint introduces a **post-release stabilization/support-window layer** for the prepared `promotion-rc.1` train.

### Policy

- a 14-day support window is declared
- the train is patch-only by default
- a deliberate next minor may begin only when explicitly opened and documented

### Monitoring

The stabilization window explicitly monitors:

- extension activation failures
- theme regressions
- i18n regressions
- release artifact compatibility drift

### Evidence preservation

The repository now preserves the Phase 12 through Phase 14 release-evidence chain through:

- `phase-15-evidence-integrity-manifest.json`
- `artifacts/releases/support-window-rc.1/`
- `immutable-evidence-bundle.tar.gz`

### Claim safety

The generated minimum closure checklist explicitly records that final success may **not** yet be claimed because:

- publication remains blocked
- there is still no public released artifact set in this environment
- earlier strict-closure blockers remain unresolved

## Consequences

### Positive

- post-release stabilization is now part of certification maturity rather than an afterthought
- the release evidence chain is preserved more strongly and more transparently
- next-train roadmap items are documented without silently expanding the frozen certification boundary

### Remaining limits

This checkpoint does **not** convert the repository into:

- a public released train
- a fully green strict closure suite
- a valid final certification claim

It is a maturity checkpoint, not the end of the release process.
