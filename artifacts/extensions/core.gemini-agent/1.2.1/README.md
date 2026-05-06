# @mdwrk/extension-gemini-agent

First-party Gemini workflow extension for MdWrk.

## Manifest and compatibility

- manifest export: `./manifest`
- bundled entry export: `./bundled`
- compatibility declarations: host API, runtime, app, theme contract, renderer, and editor ranges are declared in `src/manifest.ts`
- lifecycle model: bundled first-party extension activated through `@mdwrk/extension-runtime`

## Capabilities

- reads the active markdown document
- reads the current selection
- registers commands, a modal view, and an action-rail entry
- publishes notifications and diagnostics
- reads and writes extension configuration
- performs network fetches for Gemini API requests
- supports opt-in editor writeback through explicit user commands only

## Settings schema

The package ships a real settings schema with sections for:

- provider / endpoint / model / authentication
- context attachment behavior
- writeback control

Source anchors:

- `src/settings.ts`
- `src/manifest.ts`

## i18n readiness

The package ships package-local locale catalogs and loader definitions:

- `src/i18n.ts`
- `src/locales/en.ts`
- `src/locales/es.ts`

All user-facing labels in the manifest and settings schema are `I18nLabel` descriptors.

## Lifecycle and host/runtime integration tests

- `tests/run-smoke.mjs` exercises manifest structure, prompt building, provider helpers, configuration defaults, and service behavior against a mocked host/runtime context

## Install / configuration guidance

This package is intended for first-party bundling into `apps/client`.
Configuration is done through the shared settings surface after activation.
Writeback remains opt-in and disabled by default.

## API/reference docs

See the generated reference page at:

- `docs/reference/packages/mdwrk-extension-gemini-agent.md`
