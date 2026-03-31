# Package certification criteria

## Purpose

This document defines the repository-internal criteria for declaring an app or package “certifiably fully featured.”

## Important scope note

This repository uses **repository-internal conformance and certification criteria**.
It does **not** claim conformance to any unspecified external standards corpus.

As of the Phase 0 certification-target freeze, this repository now explicitly adopts the frozen Markdown target documented in:

- `docs/conformance/markdown-targets.md`
- `docs/conformance/markdown-profile-matrix.json`

In this repository, “repository-internal RFC compliant” means compliant with:

- accepted ADRs
- package contracts
- schema requirements
- conformance specifications adopted by this repository
- the frozen Markdown target where the package/app claims Markdown behavior

## Terms

### Fully featured
A package or app provides the intended capability set for its declared scope.

### Certifiably fully featured
A package or app is fully featured **and** has the evidence required by this document.

### Repository-internal RFC compliant
A package or app conforms to the accepted ADRs, package contracts, schema requirements, and frozen conformance targets that apply to it.

### Markdown spec compliant (frozen target)
A relevant package or app conforms to the frozen Markdown target defined by this repository for:

- CommonMark 0.31.2 core
- GFM 0.29-gfm default profile
- any optional profile explicitly named in the profile matrix and included in the active certification boundary

## Criteria for applications

An application is certifiably fully featured only if it has:
- a documented purpose and ownership model
- a documented public configuration surface
- successful build and typecheck in CI
- automated tests appropriate to its scope
- documented dependency boundaries
- release/deploy documentation
- no unresolved critical boundary violations
- a conformance record in repository documentation

If the application claims Markdown authoring or rendering behavior, it must also have:
- the relevant frozen-target conformance evidence
- documented settings/policy behavior for optional Markdown profiles
- documented preview/export behavior where applicable
- documented raw HTML trust/sanitization behavior where applicable
- parity evidence for required UIX surfaces where the certification boundary requires it

## Criteria for reusable packages

A reusable package is certifiably fully featured only if it has:
- a clear package purpose
- typed public exports
- README and API documentation
- semantic versioning
- automated tests
- examples or integration fixtures where applicable
- compatibility declarations
- changelog/release evidence
- no forbidden imports across package boundaries
- conformance to its relevant contracts and ADRs

If the package claims Markdown behavior, it must also have:
- tests against the frozen Markdown target relevant to its scope
- explicit support/limitations documentation for profiles and policies
- stable public behavior across buildable package outputs

## Criteria for contract packages

A contract package is certifiably fully featured only if it has:
- normative types and exports
- standalone build output
- compatibility baselines
- machine-readable schema where applicable
- contract documentation for package consumers
- versioned public surface
- no app-level implementation dependency leakage

## Criteria for extension packages

An extension package is certifiably fully featured only if it has:
- a valid extension manifest
- documented capabilities/permissions
- settings schema where configuration exists
- i18n-ready labels and messages
- an icon descriptor
- lifecycle tests (activation/deactivation)
- manifest validation tests
- integration tests against the host/runtime
- compatibility declarations
- README with install/configuration/limitations guidance
- conformance to the extension runtime and manifest specs

If the extension affects Markdown behavior, settings, theme, locale, or shell surfaces inside the certification boundary, it must also have:
- frozen-target behavior documentation where applicable
- compatibility with the current host/runtime baselines
- tests or fixtures for the settings/locale/theme behavior it injects

## Required evidence

The following evidence is required for certification:
- CI build/test/typecheck results
- manifest/schema validation results where applicable
- package inventory entry
- compatibility declaration
- release/version history
- documented owner and support status
- any required examples or snapshot baselines

For Markdown-facing surfaces, required evidence additionally includes:
- frozen-target corpus or equivalent conformance results for the relevant scope
- preview/export evidence where applicable
- settings/profile evidence where applicable
- UIX parity evidence where the client boundary requires it

## Current state of this repository

At this Phase 0 checkpoint, the repository is **not yet certifiably fully featured**, **not yet repository-internally RFC compliant across the full frozen boundary**, and **not yet fully closed against the frozen Markdown target**.

This checkpoint does provide:
- the explicit Markdown target freeze
- the explicit certification boundary
- the policy ADR needed to govern later implementation work
- the current-state and parity-gap documentation needed to continue toward strict conformance closure
