# Repository Agent Instructions

## Purpose of the repository
This repository defines and maintains a markdown-driven workspace used to author, validate, and evolve project guidance, UI/UX expectations, and implementation instructions for agents and contributors.

## Repository overview
- The repository is instruction-first: changes should keep guidance clear, current, and directly actionable.
- Agent behavior, UI quality standards, and validation expectations are treated as part of the product.
- Documentation changes must be consistent, precise, and structured so downstream agents can reliably execute them.

## Styling and coding preferences
- Prioritize readability, consistency, and maintainability in all code and documentation.
- Keep UI composition intentionally minimal: compact icons, minimal labels, and clean spacing.
- Include placeholders in input fields to clarify expected user input.
- Only include input fields when they are necessary for user tasks or workflows.
- Avoid visual clutter at all times; every visual element must have a clear purpose.
- Prefer small, reusable components and concise styling patterns over one-off complexity.

## Screenshots and visual QA workflow
- Agents must take screenshots of every component and view they change.
- After capturing screenshots, agents must review them critically and continue iterating on UI/CSS until the result strongly aligns with prompt expectations.
- The final result must exceed baseline UI/UX and CSS quality standards, delivering exceptional clarity, polish, and usability.
- Capture all relevant views, modes, panes, and modals for each supported theme.

## Versioning and infrastructure constraints
- Always increment the package version on every commit, using only minor or patch releases.
- Docker Compose must never expose ports.

## Aspect ratios and responsive support requirements
Viewport and aspect ratio breakpoints are defined once in `client/public/css/base/viewports.css` and must remain consistent across themes. Themes are responsible for unique styling within each supported band.

### Required aspect ratio classes
- Portrait
- Square / Hybrid
- Landscape
- Wide
- Ultra-wide

### Required width tiers
- XS
- SM
- MD
- LG
- XL
- XXL

### Required height tiers
- Short
- Compact
- Tall
- Ultra-tall

### Required device view/input types
- Touch-first devices
- Precision pointer devices
