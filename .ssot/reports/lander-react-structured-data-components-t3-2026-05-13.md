# Lander React Structured Data Components T3 Evidence

Date: 2026-05-13

Boundary: `bnd:lander-react-structured-data-reusable-components-current`

Scope:

- 42 `feat:lander-react.structured-data.*-reusable-component` features.
- One reusable `@mdwrk/lander-react` JSON-LD component surface per supported structured-data type.
- Visible reusable lander components for `BreadcrumbList` and `FAQPage` surfaces.

Verification:

- `npm run typecheck -w @mdwrk/lander-react`
- `npm run test -w @mdwrk/lander-react`
- `uv run ssot-registry validate .`

Result:

- `@mdwrk/lander-react` typecheck passed.
- `@mdwrk/lander-react` smoke test passed.
- SSOT registry validation passed.
- The smoke test renders every governed reusable structured-data component and asserts the expected Schema.org `@type` appears in the emitted JSON-LD script payload.
