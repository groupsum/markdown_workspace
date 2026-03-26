# Extension Manager

## Purpose

`mdwrk/extension-manager` is the first packaged first-party bundled extension. It proves that the shared runtime can load a real packaged extension that contributes commands, views, action-rail entries, diagnostics, and schema-driven settings forms.

## Responsibilities

The Extension Manager package currently provides:

- a manifest-compliant bundled extension package
- a packaged activation entry point
- an Extension Manager modal view
- an action-rail contribution in the `extensions` group
- inventory of bundled and installed runtime extensions known to the runtime
- enabled/disabled controls
- activate/deactivate controls
- compatibility display
- capability display
- runtime health and diagnostics display
- schema-driven settings rendering for extensions that declare `settingsSchema`

## Current runtime integration

`apps/client` registers the packaged Extension Manager through the shared `mdwrk/extension-runtime` package during client boot. The client no longer needs a hardcoded local operator console to browse runtime state.

The manager already distinguishes runtime source `bundled` vs `installed` for extensions that have been installed through the formal external catalog path.

## Current scope limits

This checkpoint does **not** yet make the manager UI the only way to drive external catalog installs. The runtime API and conformance tooling are ahead of the client-facing catalog-browsing UX.

Remaining UX hardening opportunities include:
- richer catalog discovery and search
- interactive install/update/remove controls for arbitrary loaded catalogs
- richer trust-policy editing flows
- richer certification badges and review surfaces

## Why this package matters

This package is the proof point that the host from Phase 6 and the runtime from Phases 7 through 13 are sufficient to support publishable first-party extensions and to surface installed external extensions without requiring app-local special cases.
