# ADR-1023: ADR-0023 — Certification before promotion (Phase 16 checkpoint)

# ADR-0023 — Certification before promotion (Phase 16 checkpoint)

Date: 2026-03-30
Status: accepted for the current checkpoint zip

## Context

Up through Phase 15, the repository still treated publication and live post-release activity as part of the minimum closure checklist that blocked the final success claim.

That model is incompatible with the repository owner's explicit rule for final closure:

- first certify from RC artifacts;
- only then publish, tag, release, and open the live support window.

The repository therefore needed a formal policy correction before final closure could proceed honestly.

## Decision

The repository now splits the endgame into two distinct gates.

### Gate A — Certification gate

The certification gate is the only gate that controls whether the repository may claim that it is certified.

The certification gate requires:

- all strict conformance, parity, package-boundary, and evidence lanes green from RC artifacts;
- the final claim language frozen and narrow;
- the hard closure rules green;
- no blocked strict-conformance evidence remaining inside the frozen certification boundary.

### Gate B — Promotion gate

The promotion gate is the release execution gate.

The promotion gate covers:

- publish from validated RC artifacts
- validate from published artifacts
- Git tag creation
- GitHub release creation
- live support window on published artifacts

These remain real release requirements, but they no longer block the statement “the repository is certified.”

## Claim language

The final claim language is frozen as:

- repository-internal certifiably fully featured
- repository-internal certifiably compliant
- externally frozen CommonMark/GFM markdown target conformance for the declared profile set

No broader standards language may be used unless the evidence actually supports it.

## Consequences

### Positive

- the repository now has a coherent certify-first policy that matches the owner's release model
- final certification is no longer self-blocked by publication steps that logically come after certification
- release blockers remain visible, but they are correctly categorized as promotion blockers rather than certification blockers

### Remaining blockers

This decision does **not** itself certify the repository.

The certification gate is still blocked by:

- browser matrix
- browser-driven visual regression
- full packed-tarball install for the release set
- the hard Markdown closure rule for the full official frozen-target corpus

The promotion gate is also still blocked, but those blockers are no longer treated as certification blockers.
