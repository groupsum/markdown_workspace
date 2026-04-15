# ADR-1021: ADR-0021 — promotion and release Phase 14 checkpoint

# ADR-0021 — promotion and release Phase 14 checkpoint

Date: 2026-03-30  
Status: accepted for the current checkpoint bundle

## Context

Phase 13 prepared an RC.1 train but explicitly did **not** accept it for final promotion because:

- browser matrix remained blocked
- browser-driven visual regression remained blocked
- the hard closure rule for full frozen-target Markdown corpus closure remained blocked
- npm publication could not execute without an auth token

The repository therefore needed a final release/promotion packaging phase that could:

- preserve evidence in dependency order
- emit release notes with explicit claim language
- bundle extension artifacts and evidence in a promotion-ready form
- avoid overstating publication or certification when the evidence does not support it

## Decision

For the Phase 14 checkpoint, the repository will generate a **promotion-and-release evidence bundle** without pretending that the public release actually occurred.

### What Phase 14 does

- defines the dependency-ordered publish manifest
- regenerates publish-readiness and release-evidence records from the current checkout
- creates a promotion-scoped extension catalog file
- creates an extension artifact bundle tarball
- creates a final evidence tarball
- creates Git tag / GitHub release metadata files
- creates final release notes with explicit boundary language
- records which release outputs exist and which are blocked in the current environment

### What Phase 14 does not do

Phase 14 does **not** claim that the following happened when they did not:

- npm publication
- Git tag creation
- GitHub release creation
- final repository-internal certification
- externally frozen CommonMark/GFM conformance release claim

## Consequences

The repository now has a coherent promotion bundle that can be audited and handed off for a real release environment.

However, the correct public status of this checkpoint remains:

- promotion artifacts prepared
- release notes prepared
- evidence preserved
- public release blocked

That is the strongest honest statement supported by the evidence.
