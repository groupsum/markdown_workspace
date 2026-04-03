# Theme Studio extension

## Purpose

`mdwrk/extension-theme-studio` is the first-party theme authoring extension package for Markdown Workspace.

It exists to prove that theme authoring can be delivered through the formal extension host APIs rather than through client-local DOM patching or direct imports from app internals.

## Responsibilities

The package currently provides:

- token inspection against `mdwrk/theme-contract`
- token editing through host theme draft APIs
- renderer/editor live preview surfaces using the shared portable packages
- a workspace-pane surface with a dedicated collapsible sidebar
- single-pane and split-screen authoring layouts
- a grouped view-toolbar for preview/apply/revert/import/export actions
- class/token relationship inspection derived from the formal class and bridge definitions
- preview, apply, and revert actions
- export generation for:
  - theme preset JSON
  - host CSS token variables
  - renderer bridge CSS variables
  - editor bridge CSS variables
  - portable theme package scaffold artifact

## Package boundaries

The package depends on:

- `mdwrk/extension-manifest`
- `mdwrk/extension-host`
- `mdwrk/extension-runtime`
- `mdwrk/theme-contract`
- `mdwrk/ui-tokens`
- `mdwrk/markdown-renderer-react`
- `mdwrk/markdown-editor-react`

The package does **not** import `apps/client` internals.

## Runtime shape

The bundled entry registers:

- one command to open Theme Studio
- one main workspace view
- one appearance-group action-rail item
- one settings section backed by the manifest schema
- one extension-local service for token state, preview/apply/revert flows, and export generation

## Export artifact format

The current package scaffold export is a structured artifact object containing files for:

- `package.json`
- `README.md`
- `dist/index.css`
- `dist/renderer.css`
- `dist/editor.css`
- `themes/<theme-id>.json`

This is sufficient for a first-party checkpoint and for downstream packaging experiments, but it is not yet a signed distribution artifact.

## Current limitations

This checkpoint does not provide a standalone modal workflow for Theme Studio.

It also does not yet provide:

- a zip/tarball package exporter inside the extension UI
- third-party distribution or catalog publishing
- automated certification evidence for the package
- full workspace-wide verification reruns in this container
