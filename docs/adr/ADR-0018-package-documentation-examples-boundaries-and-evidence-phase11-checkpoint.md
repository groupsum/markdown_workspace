# ADR-0018 — Phase 11 package documentation, examples, contract boundaries, and evidence checkpoint

Date: 2026-03-28
Status: accepted for the current checkpoint zip

## Context

By the end of Phase 10, the repository had implemented most of the core functional work across parser/rendering, editor authoring, shell parity, Git/settings parity, theme/token parity, and i18n.

What remained for credible certification was not primarily new product behavior, but **evidence quality**:

- reusable packages needed explicit API/reference documentation and clearer semver/boundary evidence
- extension packages needed stronger package-level documentation for manifests, capabilities, settings, locale readiness, lifecycle coverage, and installation guidance
- apps needed explicit documentation for public config surfaces, dependency boundaries, release/deploy notes, conformance linkage, and support/ownership
- examples needed to be clearly framed as consumers of the public package APIs rather than hidden workspace internals
- the repository needed a machine-readable package/app/example certification matrix rather than a loose set of README files

## Decision

The Phase 11 checkpoint therefore standardizes on the following repository evidence model.

### 1. Every workspace package/app/example gets a generated reference page

The checkpoint now generates one reference page per workspace package/app/example under `docs/reference/`.
Those pages record:

- public exports
- typed export surface
- README presence
- test/examples/integration fixtures
- semver and compatibility declarations
- release evidence inputs
- boundary-audit result

### 2. The repository now carries an explicit workspace certification matrix

The Phase 11 matrix (`docs/reference/workspace-package-certification-matrix.md`) records whether each workspace entry satisfies the checkpoint criteria for its category.

### 3. Extension-package requirements are documented as package-level obligations

For extension packages, the checkpoint treats the following as first-class documentation/evidence requirements:

- manifest presence and compatibility declarations
- capability docs
- settings schema docs
- i18n-ready labels/catalog notes
- lifecycle / integration test evidence
- install/configuration guidance

### 4. Apps are documented as integration hosts, not reusable libraries

The checkpoint adds app-level docs that capture:

- public config surfaces
- dependency boundary maps
- release/deploy notes
- conformance linkage
- support / ownership status

### 5. Examples are treated as certification fixtures

The examples are explicitly documented and audited as **public package surface** fixtures.
They are not allowed to rely on private workspace wiring for certification credit.

## Consequences

### Positive

- package/app/example evidence is now centralized and machine-readable
- API/reference visibility is substantially better than in earlier checkpoints
- package boundary rules are explicit rather than implied
- extension package docs are materially stronger and more reviewable
- the repository can now be evaluated as a publishable monorepo rather than as a collection of partly documented implementations

### Remaining limits

This decision does **not** itself grant final certification.
It improves certifiability and repository maturity, but the remaining final-evidence gaps still include:

- stronger frozen-target Markdown conformance closure
- browser-driven visual regression evidence
- packed-artifact and release-promotion closure
