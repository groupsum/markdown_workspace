# @mdwrk/extension-theme-studio

First-party Theme Studio extension package for Markdown Workspace.

## Manifest and compatibility

- manifest export: `./manifest`
- bundled entry export: `./bundled`
- compatibility declarations: host API, runtime, app, and theme contract ranges are declared in `src/manifest.ts`
- lifecycle model: bundled first-party extension activated through `@mdwrk/extension-runtime`

## Capabilities

- inspect formal theme tokens and stable class contracts
- edit token drafts without importing client internals
- preview renderer/editor bridge behavior against shared package contracts
- apply or revert theme drafts through host theme APIs
- export theme presets as JSON, CSS, and theme-package scaffold artifacts
- register commands, a pane-first workspace view, an action-rail item, and settings-menu content

## Settings schema

The package ships a settings schema covering:

- preview behavior
- export defaults
- package scaffold metadata

Source anchors:

- `src/settings.ts`
- `src/manifest.ts`

## i18n readiness

The package ships package-local locale catalogs and loader definitions:

- `src/i18n.ts`
- `src/locales/en.ts`
- `src/locales/es.ts`

All user-facing manifest/view/settings labels are `I18nLabel` descriptors.

## Lifecycle and host/runtime integration tests

- `tests/run-smoke.mjs` exercises manifest structure, settings resolution, class relationships, export generation, theme bridge previews, and service behavior against a mocked host/runtime context

## Install / configuration guidance

This package is intended for first-party bundling into `apps/client`.
Use it when validating the portable theme/token contract, editor/renderer bridge behavior, and generated theme export artifacts.

## API/reference docs

See the generated reference page at:

- `docs/reference/packages/mdwrk-extension-theme-studio.md`
