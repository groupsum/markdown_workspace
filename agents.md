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
- Multiple screenshots are required for each updated view, modal, or interactive object to capture the states being interacted with.
- If a component or view is added, updated, or changed, agents must capture multiple screenshots of that view state progression; a single screenshot of the first app view is not satisfactory.
- After capturing screenshots, agents must review them critically and continue iterating on UI/CSS until the result strongly aligns with prompt expectations.
- The final result must exceed baseline UI/UX and CSS quality standards, delivering exceptional clarity, polish, and usability.
- Capture all relevant views, modes, panes, and modals for each supported theme.
- Always use screenshots to show all views, modes, panes, and modals for each and every theme such that we can validate each and every theme for each and every view, mode, pane, modal.

## Versioning and infrastructure constraints
- Always increment the package version on every commit, using only minor or patch releases.
- Docker Compose must never expose ports.

## Aspect ratios and responsive support requirements
Viewport and aspect ratio breakpoints are defined once in `client/public/css/base/viewports.css` and must remain consistent across themes. Themes are responsible for unique styling within each supported band.

The contract includes portrait, square/hybrid, landscape, wide, and ultra-wide aspect ratios plus XS/SM/MD/LG/XL/XXL width tiers, short/compact/tall/ultra-tall height tiers, and touch/precision device classes.

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

## Test tooling instructions
- Do not run `pytest` or `peagen` unless instructed to.
- If running `pytest` on the swarmauri-sdk, always run tests from `/workspace/swarmauri-sdk/pkgs` using: `uv run --package <member name> --directory <package directory name> pytest`.
- If running `peagen`, use the `peagen` command and reference docs in `standards/peagen` as needed.

## Agent TODO tracking note
- Keep the active UI/UX checklist in `CHECKLIST.md` current as work progresses.
- If a checklist item has not been implemented and verified, it must remain unchecked.

## Mandatory autonomous test-loop protocol
- Always execute work in fast, decisive bursts.
- For every task, follow this sequence before and during implementation: review prior notes, review current features, create a plan, notate the plan, execute, test, verify, repeat.
- Prior notes must be reviewed from `AGENT_NOTES.md` at the start of each burst.
- Plans and outcomes must be recorded in `AGENT_NOTES.md`.
- The full loop specification in `TEST_LOOP_WORKFLOW.md` is required process guidance and must be followed.
- During implementation cycles that involve runnable services, perform this minimum sequence:
  1. start uvicorn backend;
  2. start `admin_client` and `public_client`;
  3. exercise hooks and GUI in both clients;
  4. inspect network capture (headers/payloads/responses sent and received);
  5. determine whether failures occurred and why;
  6. remediate;
  7. repeat until issues are resolved.
- After issue resolution, assess each project for gaps, errors, issues, and potential change requests.
- Document change requests, feature requests, and bugs as self-notes in `AGENT_NOTES.md`.
- Update this `agents.md` file whenever procedure expectations evolve, so future runs inherit the same discipline.
