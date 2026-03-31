# Phase 15 — post-release stabilization and support window

Date: 2026-03-30  
Checkpoint type: support-window and evidence-preservation checkpoint

## Purpose

This checkpoint hardens the repository's certification maturity story *after* promotion prep.
It exists to prove that the project does not stop at a promotion bundle, but also defines how the prepared train would be stabilized, monitored, and preserved.

## Scope of this checkpoint

This checkpoint produces:

- a short support-window policy for the prepared `promotion-rc.1` train
- a patch-only acceptance rule for that train
- a monitoring matrix for the most important regression classes
- an immutable evidence integrity manifest
- a support-window release bundle
- a next-train roadmap for intentionally out-of-boundary follow-on work
- a minimum closure checklist explaining why final claim success is still blocked

## Support-window policy

The support window in this checkpoint is:

- start: `2026-03-30`
- end: `2026-04-13`
- duration: `14` days

Important: there is still no public published release in this environment.
Therefore the support window here is a **policy-defined stabilization window for the prepared promotion bundle**, not a live support window on published npm artifacts.

## Accepted change policy

Default rule:

- patch-only fixes on the prepared train

Exception:

- a deliberate next minor may start only when explicitly opened and documented

## Monitoring focus

This checkpoint explicitly monitors:

- extension activation failures
- theme regressions
- i18n regressions
- release artifact compatibility drift

## Evidence preservation

The repository now carries:

- `artifacts/conformance/latest/phase-15-evidence-integrity-manifest.json`
- `artifacts/releases/support-window-rc.1/immutable-evidence-bundle.tar.gz`
- `artifacts/releases/support-window-rc.1/bundle-manifest.json`

These artifacts preserve the Phase 12 through Phase 14 evidence chain in an immutable support-window bundle.

## Next-train candidates (not blockers)

The generated roadmap keeps the following items outside the frozen boundary:

- richer table editor UX
- bibliography manager depth
- advanced citation workflows
- HTML trust-mode refinement
- optional underline extension if intentionally adopted

## Why final success is still not claimable

The minimum closure checklist generated in this checkpoint still blocks final success because:

- the publication step is not complete
- the prepared train is not a public release
- earlier strict-closure blockers from Phase 12 and Phase 13 are still unresolved

## Honest status

This is a valid **Phase 15 post-release stabilization/support-window checkpoint**.

It is **not**:

- a public post-release support window on published artifacts
- a final repository-internal certification closure
- a final externally frozen markdown target conformance release
