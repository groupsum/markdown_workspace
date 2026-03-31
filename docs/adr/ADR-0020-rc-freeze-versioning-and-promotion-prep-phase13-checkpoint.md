# ADR-0020 — RC freeze, versioning, and promotion prep (Phase 13 checkpoint)

Date: 2026-03-29  
Status: accepted for the current checkpoint line

## Context

Phase 12 assembled a strict closure suite, but it did not justify immediate publication.
The repository still had explicit blockers in the browser matrix, browser-driven visual regression, and the full frozen-target Markdown closure rule.

Publishing directly from the first partially-green closure-suite run would have overstated release readiness.
The correct next step was therefore to cut an explicit **RC train** and verify that the repository could regenerate its evidence from versioned tarballs rather than workspace symlinks.

## Decision

This checkpoint cuts **RC.1** for the affected package families and validation apps/examples.

### Included in this decision

- release-family changesets for the client, editor, renderer, shared/theme, and extension families
- RC-tagged versions across the affected public package line
- RC-tagged versions for the private validation tarball line (`@mdwrk/lander`, `@mdwrk/example-editor-basic`, `@mdwrk/example-renderer-basic`)
- semver-compatible RC internal dependency ranges in place of workspace protocol links
- regenerated publishable tarballs
- regenerated private validation tarballs
- regenerated extension artifacts/signatures
- regenerated release evidence and publish-readiness records
- successful portable-subset tarball install verification
- structural app/example validation against RC tarballs rather than workspace links
- a dedicated `artifacts/releases/rc.1/` release bundle

### Explicitly not claimed

This checkpoint does **not** claim that RC.1 is accepted for promotion.
It claims only that RC.1 is **prepared**.

## Consequences

### Positive

- version inventory and tarball catalogs now match the RC line
- apps/examples are no longer represented only through workspace protocol validation
- extension artifact generation is tied to the RC line
- release evidence can now be reviewed as an explicit RC bundle rather than an abstract future step

### Remaining blockers

- browser matrix remains blocked
- browser-driven visual regression remains blocked
- full frozen-target Markdown closure rule remains blocked
- publish readiness remains blocked without an npm auth token

## Certification effect

This ADR authorizes the narrower statement that the repository now has a **prepared RC.1 train**.
It does **not** authorize the statement that RC.1 is ready for final promotion or final certification.
