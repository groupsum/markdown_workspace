# Editor UIX Agent Instructions

Editor packages are UIX-focused surfaces. Treat editing ergonomics, keyboard behavior, toolbar clarity, split-pane behavior, accessibility, and authoring-state continuity as first-class requirements.

- Use the `uix_specialist` custom agent for delegated editor package analysis or implementation.
- Validate user-facing editor changes with screenshots for every affected view, mode, pane, modal, and theme.
- Keep editor-core behavior portable; React package UI should adapt to core contracts instead of duplicating editor semantics.
- Prefer iconographic controls with clear accessible labels and tooltips over text-heavy toolbar controls.
