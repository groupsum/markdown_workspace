# ADR-0006: release, versioning, and conformance

- Status: Accepted
- Date: 2026-03-20

## Context

A multi-package repository requires a shared versioning and certification model to make releases trustworthy.

## Decision

Adopt SemVer for publishable packages and define repository-internal conformance criteria for apps, reusable packages, and extensions.
A package is only certifiably fully featured when its implementation and evidence satisfy the documented criteria.

## Consequences

- release automation must produce package-level evidence
- CI must validate contracts and boundaries
- “RFC compliance” within this repository is measured against accepted ADRs and formal package specifications unless an external RFC target is explicitly adopted
