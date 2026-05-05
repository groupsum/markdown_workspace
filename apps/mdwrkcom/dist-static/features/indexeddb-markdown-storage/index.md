# IndexedDB Markdown storage

Browser-local persistence keeps MdWrk's default authoring workflow independent from hosted document storage.

IndexedDB Markdown storage is part of MdWrk's local-first product boundary. The workspace can keep project state on the user's device during ordinary writing, preview, and organization, instead of requiring every editing action to depend on a hosted authoring backend.

This design keeps storage policy understandable. Local persistence supports daily authoring. Export, repository, and sync flows remain visible choices that move content across a boundary when the user chooses that workflow.

The public lander presents this as product truth from the MdWrk content pack. Generic lander packages only enforce the content model, metadata, FAQ, and diagnostics that make the page portable.

## Frequently Asked Questions

### How does MdWrk store Markdown locally?

MdWrk uses browser-local persistence for workspace state so normal authoring can remain local-first.

### Does local storage prevent sync?

No. Sync and export workflows can be explicit integrations without becoming the default storage layer.
