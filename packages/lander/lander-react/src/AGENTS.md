# Lander React Structured Data Source Instructions

This source tree owns the React-side structured data composition for portable lander pages.

- Use the `uix_specialist` custom agent for delegated work in this directory.
- Prefer reusable component or helper composition over page-specific conditionals scattered through app code. New schema support should extend the portable composition layer cleanly.
- Keep `JsonLd` emission deterministic: normalize inputs, avoid duplicate nodes, preserve canonical URLs and stable IDs, and emit only the schema types the page contract actually supports.
- Treat `@mdwrk/structured-data` as the reusable builder layer and this package as the React orchestration layer. If a capability belongs in a generic Schema.org builder, move it there instead of hard-coding it in JSX flow.
- Do not introduce raw inline JSON-LD strings or app-only schema fragments when the same behavior can be expressed through typed helpers and reusable React composition.
