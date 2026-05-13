# How does MdWrk store Markdown locally?

A direct answer about MdWrk local persistence and storage boundaries.

MdWrk uses browser-local persistence for workspace state so authoring can remain device-local unless the user chooses a workflow that moves content elsewhere. This keeps local writing, preview, and organization available as the default path.

Local persistence does not remove export, sync, or repository workflows. It makes the storage boundary clearer by separating normal local editing from the moments when a user intentionally moves content across systems.

That boundary is part of the broader MdWrk local-first model, where Markdown authoring starts on the device and connected workflows remain explicit choices.

## Frequently Asked Questions

### How does MdWrk store Markdown locally?

MdWrk uses browser-local persistence for workspace state so normal authoring can remain local-first.
