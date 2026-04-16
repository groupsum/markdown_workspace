# ADR-1001: ADR-0001: monorepo and package topology

# ADR-0001: monorepo and package topology

- Status: Accepted
- Date: 2026-03-20

## Context

The repository currently has two top-level app roots and no formal workspace package topology. This blocks sustainable package growth, extension packaging, and CI/CD scale.

## Decision

Adopt a root npm workspace with the following top-level structure:
- `apps/`
- `packages/`
- `docs/`
- `examples/`

Adopt the npm scope `@mdwrk/*` for new packages.

## Consequences

- `client/` will move to `apps/client/`
- `lander/` will move to `apps/lander/`
- reusable code will be extracted into publishable packages
- dependency boundaries can be enforced
