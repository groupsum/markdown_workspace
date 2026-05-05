# Client Styles Agent Instructions

Client styles are styles-focused and screenshot-gated. This tree owns base structure, theme files, modal layout, pane layout, and viewport-specific behavior for the MdWrk client.

- Use the `styles_specialist` custom agent for delegated CSS, theme, and visual parity work.
- Keep viewport and aspect-ratio breakpoint definitions in `base/viewports.css`; themes may style bands but must not fork breakpoint semantics.
- Do not expose Docker Compose ports while validating style changes.
- Always capture screenshots for each affected view, mode, pane, modal, and theme before declaring visual work complete.
