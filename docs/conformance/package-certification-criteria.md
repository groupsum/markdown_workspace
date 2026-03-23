# Package certification criteria

## Purpose

This document defines the repository-internal criteria for declaring an app or package “certifiably fully featured.”

## Important scope note

This repository uses **repository-internal conformance and certification criteria**.
It does **not** claim conformance to any unspecified external IETF or standards-body RFC set.

In this repository, “RFC compliant” means compliant with the accepted ADRs, package contracts, schema requirements, and conformance specifications adopted by this repository.

## Terms

### Fully featured
A package or app provides the intended capability set for its declared scope.

### Certifiably fully featured
A package or app is fully featured **and** has the evidence required by this document.

### RFC compliant (repository-internal)
A package or app conforms to the accepted ADRs, package contracts, and schema requirements that apply to it.

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

## Required evidence

The following evidence is required for certification:
- CI build/test/typecheck results
- manifest/schema validation results where applicable
- package inventory entry
- compatibility declaration
- release/version history
- documented owner and support status
- any required examples or snapshot baselines

## Current state of this repository

At this Phase 3 checkpoint, the repository is **not yet certifiably fully featured** and **not yet certifiably fully RFC compliant**.

This checkpoint provides implemented contract packages, implemented shared packages, and the documentation required to continue toward renderer/editor/runtime extraction, but not yet the full implementation and evidence required to satisfy repository-wide certification.
