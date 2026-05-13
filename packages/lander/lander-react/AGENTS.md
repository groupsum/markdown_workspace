# Lander React Agent Instructions

This package is the reusable and portable React implementation layer for MdWrk lander surfaces, including structured data emission. It should express discoverability behavior through reusable components and helpers, not app-local one-off markup.

- Use the `uix_specialist` custom agent for delegated frontend, UIX, component, layout, and structured-data rendering work in this package.
- Implement structured data through reusable and portable React components that consume shared package contracts, especially `@mdwrk/structured-data`, instead of hand-writing per-page JSON-LD blobs in app code.
- Keep the package portable across MdWrk lander apps: avoid app-specific file-system assumptions, route wiring, or one-site-only branching unless the public component contract explicitly allows it.
- Keep React output deterministic and static-safe for SSR and pre-rendered builds. Structured data emission should remain stable, minimal, and easy to compose from compiled page metadata.
- Coordinate contract changes with `@mdwrk/lander-content-contract`, `@mdwrk/lander-core`, and `@mdwrk/structured-data`, and update package tests when any schema or component behavior changes.
- When a change affects rendered public output, verify the impacted views with screenshots in addition to package-local smoke validation.
