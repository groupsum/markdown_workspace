# Renderer UIX Agent Instructions

Renderer packages are UIX-focused reading and preview surfaces. Preserve markdown fidelity while making preview interactions, code blocks, embeds, and theme integration feel consistent with the editor.

- Use the `uix_specialist` custom agent for delegated renderer package work.
- Screenshot affected render states across all relevant themes and responsive bands.
- Keep renderer-core framework-neutral; React-specific presentation belongs in React renderer packages.
- Do not let style fixes change markdown parsing or rendering semantics without explicit tests.
