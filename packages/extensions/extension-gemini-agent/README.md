# @markdown-workspace/extension-gemini-agent

First-party Gemini workflow extension for Markdown Workspace.

## Capabilities

- reads the active markdown document
- reads the current selection
- opens a bundled Gemini operator view from the action rail
- drafts rewrite results without automatically applying them
- supports opt-in writeback to the current selection or document
- publishes runtime diagnostics for configuration, execution, and writeback outcomes

## Safe writeback model

Writeback is disabled by default.

The extension can:
- summarize the current file without modifying it
- draft a rewrite for the current selection without modifying it
- apply a draft to the current selection or replace the current document only when the `allowWriteBack` setting is enabled and the user explicitly triggers apply

## Packaging

This package is publishable as an npm package and bundled into `apps/client` through `@markdown-workspace/extension-runtime`.
