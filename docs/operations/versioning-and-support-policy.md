# Versioning and support policy

## Package naming policy

### Scope
All new workspace packages shall use the npm scope:

- `@markdown-workspace/*`

### Package names
Use descriptive, stable, lowercase kebab-case names.

Examples:
- `@markdown-workspace/extension-runtime`
- `@markdown-workspace/markdown-renderer-react`

### Extension ids
Use dot-separated ids that are stable across refactors.

Examples:
- `core.extension-manager`
- `core.gemini-agent`
- `core.theme-studio`

## Versioning policy

### Semantic versioning
All publishable packages shall use SemVer.

- MAJOR for breaking public API changes
- MINOR for backwards-compatible features
- PATCH for backwards-compatible fixes

### Pre-release channels
Allowed pre-release tags:
- `alpha`
- `beta`
- `rc`

### Multi-package release behavior
Each package version is independent unless an umbrella release is intentionally produced.

### Changesets
The workspace uses Changesets configuration under `.changeset/` for multi-package version planning and publication.

Operational scripts:
- `npm run release:status`
- `npm run release:version`
- `npm run publish:packages`

## Baseline contract versions established in Phase 2

- extension manifest schema version: `1`
- extension host API version: `1.0.0`
- extension runtime baseline declared by manifest contract: `1.0.0`
- theme contract version: `1.0.0`

These baselines are the compatibility anchors for later runtime and extension packages.

## Support policy

### Active packages
A package is actively supported when it:
- is listed in the package inventory
- has an owner or owning team
- has a declared support status where applicable
- participates in CI and release validation

### Deprecation
Deprecated packages must:
- announce replacement guidance
- publish a final deprecation notice
- remain installable for a defined grace period unless security issues require earlier withdrawal

### Security and critical fixes
Security fixes override normal feature scheduling.

## Certification policy linkage

A package cannot be declared certifiably fully featured unless:
- versioning is documented
- compatibility is declared
- support status is clear
- release evidence exists
