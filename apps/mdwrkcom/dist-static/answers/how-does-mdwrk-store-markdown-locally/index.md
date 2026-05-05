# How does MdWrk store Markdown locally?

A direct answer about MdWrk local persistence and storage boundaries.

MdWrk uses browser-local persistence for workspace state so authoring can remain device-local unless the user chooses a workflow that moves content elsewhere. This supports local writing, preview, and organization as the default path.

Local persistence does not remove export, sync, or repository workflows. It clarifies when content stays local and when an integration moves it across a boundary.

The answer is product-specific. The portable lander package only provides reusable validation, rendering, SEO, schema, and static output mechanics.

## Frequently Asked Questions

### How does MdWrk store Markdown locally?

MdWrk uses browser-local persistence for workspace state so normal authoring can remain local-first.
