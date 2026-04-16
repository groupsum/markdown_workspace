# ADR-1008: ADR-0008: release-train groups and compatibility baselines

# ADR-0008: release-train groups and compatibility baselines

- Status: Accepted
- Date: 2026-03-27

## Context

The repository now has a frozen Markdown target and a frozen certification boundary, but it still needs a stable release train and compatibility policy to carry the later conformance phases.

Without a frozen release grouping model, package families could drift independently, contract baselines could move accidentally, and application promotion could become disconnected from the reusable package evidence.

## Decision

Adopt the current v2 monorepo as the permanent release foundation for the certification program and freeze:

- the release groups for contracts, renderer, editor, shared primitives, extensions, apps, and examples
- owner lanes for every package
- the next version line for the current inspected package state
- linked Changesets groups for renderer, editor, shared `i18n`/`ui-tokens`, and the extension runtime family
- compatibility anchors based on manifest schema, host API, runtime API, theme contract, Node/npm, React peers, and the Phase 0 Markdown target
- mandatory packed tarball install validation as a release gate

Actual version bumps remain deferred until later implementation and conformance closures are green.

## Consequences

- every package now has a release group, owner lane, SemVer policy, compatibility declaration, and promotion path
- contract packages remain compatibility anchors rather than being swept into every feature train
- renderer/editor/shared/extension families now have an explicit linked-release policy
- promotion from branch to RC/release must carry compatibility and packed-artifact evidence
- this checkpoint strengthens release discipline but does **not** yet claim final certification closure
