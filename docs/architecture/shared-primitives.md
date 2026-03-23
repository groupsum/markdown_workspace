# Shared primitives

## Phase 3 shared package set

The repository now includes the following reusable shared packages:

- `@markdown-workspace/ui-tokens`
- `@markdown-workspace/icons`
- `@markdown-workspace/i18n`
- `@markdown-workspace/testing`

## Responsibilities

### `@markdown-workspace/ui-tokens`
Owns the reusable styling surface extracted from the client:
- root CSS token definitions
- markdown stylesheet
- token/class re-exports aligned to the theme contract
- theme CSS generation helpers

### `@markdown-workspace/icons`
Owns semantic icon identifiers and icon metadata that future packages can reference without importing app-local icon decisions.

### `@markdown-workspace/i18n`
Owns message descriptors, locale catalogs, and locale registry helpers for future extensions, renderer packages, editor packages, and applications.

### `@markdown-workspace/testing`
Owns shared browser and React testing helpers for future reusable package families.
