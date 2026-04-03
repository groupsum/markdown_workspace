# Extension Manager

## Purpose

`mdwrk/extension-manager` is the first packaged first-party bundled extension. It proves that the shared runtime can load a real packaged extension that contributes commands, views, action-rail entries, diagnostics, and schema-driven settings forms.

## Responsibilities

The Extension Manager package currently provides:

- a manifest-compliant bundled extension package
- a packaged activation entry point
- a workspace-pane Extension Manager view rendered in the main shell
- an action-rail contribution in the `extensions` group
- a view-toolbar with extension-wide actions grouped as toolbar buttons
- a collapsible manager sidebar and single-pane / split-screen layouts
- inventory of bundled and installed runtime extensions known to the runtime
- enabled/disabled controls
- activate/deactivate controls
- compatibility display
- capability display
- runtime health and diagnostics display
- schema-driven settings rendering for extensions that declare `settingsSchema`
- IndexedDB-backed persistence for imported or installed extensions

## Current runtime integration

`apps/client` registers the packaged Extension Manager through the shared `mdwrk/extension-runtime` package during client boot. The client no longer needs a hardcoded local operator console to browse runtime state.

The manager now distinguishes runtime source `bundled` vs `installed` for extensions that have been installed through the formal external catalog path, and it persists installed artifacts through the shared device-local IndexedDB layer.

## Current scope limits

This checkpoint removes the standalone manager modal. Extension management must happen through workspace panes, settings content, and shell sidebars instead of modal-only flows.

Remaining UX hardening opportunities include:
- richer catalog discovery and search
- interactive install/update/remove controls for arbitrary loaded catalogs
- richer trust-policy editing flows
- richer certification badges and review surfaces

## Why this package matters

This package is the proof point that the host from Phase 6 and the runtime from Phases 7 through 13 are sufficient to support publishable first-party extensions and to surface installed external extensions without requiring app-local special cases.
