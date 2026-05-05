# Version train

Date: 2026-03-27

## Purpose

This document freezes the next release train for the current v2 monorepo.
It captures the next intended version line from the current inspected state without prematurely running the release bump.

The rule for this checkpoint is simple:

- **freeze the next version line now**
- **execute the actual bump later**, once the relevant phase closures are complete

## Workspace root

| Scope | Current | Planned next line | Notes |
|---|---:|---:|---|
| `markdown_workspace` | `0.1.5` | `0.2.0` | repository-level certification train and release-policy freeze checkpoint |

## Package-family version plan

| Package / family | Current | Planned next line | Freeze rationale |
|---|---:|---|---|
| `@mdwrk/mdwrkspace` | `1.3.52` | `1.4.0` | next feature-bearing client train |
| `@mdwrk/markdown-renderer-core` | `1.0.0` | `1.1.0` | Markdown/spec/render capability expansion |
| `@mdwrk/markdown-renderer-react` | `1.0.1` | `1.1.0` | linked with renderer core |
| `@mdwrk/markdown-editor-core` | `1.0.1` | `1.1.0` | editor/authoring capability expansion |
| `@mdwrk/markdown-editor-react` | `1.0.2` | `1.1.0` | linked with editor core |
| `@mdwrk/i18n` | `1.0.0` | `1.1.0` | shared locale/platform surface expansion |
| `@mdwrk/ui-tokens` | `1.0.1` | `1.1.0` | shared token/bridge surface expansion |
| `@mdwrk/extension-runtime` | `1.0.1` | `1.1.0` | runtime/platform surface expansion |
| bundled extension packages | `1.0.1` | `1.1.0` when host/runtime/settings/i18n surfaces expand | linked runtime family train |
| `@mdwrk/extension-manifest` | `1.0.0` | `1.0.x` | hold as compatibility anchor unless schema changes |
| `@mdwrk/extension-host` | `1.0.1` | `1.0.x` | hold as compatibility anchor unless host API changes |
| `@mdwrk/theme-contract` | `1.0.0` | `1.0.x` | hold as compatibility anchor unless theme contract changes |
| `@mdwrk/icons` | `1.0.0` | `1.0.1` by default | patch unless public API expands |
| `@mdwrk/testing` | `1.0.0` | `1.0.1` by default | patch unless public API expands |
| `@mdwrk/mdwrkcom` | `0.0.11` | `0.0.12` by default / `0.1.0` if document semantics change | private app release lane |
| examples | `0.1.1` | `0.1.2` by default / minor if demo surface expands | validation/demo lane |

## Linked Changesets groups frozen in this checkpoint

The following groups are now frozen in `.changeset/config.json`:

| Linked group | Packages | Why they move together |
|---|---|---|
| renderer | `@mdwrk/markdown-renderer-core`, `@mdwrk/markdown-renderer-react` | rendering behavior must stay aligned across core and React binding |
| editor | `@mdwrk/markdown-editor-core`, `@mdwrk/markdown-editor-react` | authoring behavior must stay aligned across core and React binding |
| shared certification pair | `@mdwrk/i18n`, `@mdwrk/ui-tokens` | the certification train treats locale and token/UI bridge changes as a coordinated shared-platform surface |
| extension runtime family | `@mdwrk/extension-runtime`, `@mdwrk/extension-workspace-files`, `@mdwrk/extension-git-ops`, `@mdwrk/extension-manager`, `@mdwrk/extension-theme-studio`, `@mdwrk/extension-gemini-agent`, `@mdwrk/extension-catalog-hello` | runtime-facing extension platform changes must remain compatible across the family |

## Packages intentionally not linked

| Package / family | Why not linked |
|---|---|
| contract packages | these are compatibility anchors and should not be forced to move with feature trains |
| `@mdwrk/mdwrkspace` | the client app must be able to promote after package closure, not in lockstep with every library change |
| `@mdwrk/mdwrkcom` | the private app has a deployment lane, not a public package train |
| `@mdwrk/icons`, `@mdwrk/testing` | patch-level utilities should not be swept into shared minor bumps by default |
| examples | examples follow validation/demo needs, not package publication cadence |

## Execution note

This checkpoint freezes the train only.
It does **not** run `release:version`, does **not** update the actual package versions yet, and does **not** claim release-candidate readiness.

The actual bump is deferred until the relevant implementation and conformance closure phases are green.

The frozen version plan is now also revalidated against the current workspace package graph via `artifacts/conformance/latest/phase-1-package-graph-audit.json`.

## Phase 9 execution note

The original Phase 1 freeze held `@mdwrk/theme-contract` on `1.0.x` unless the public contract changed.
Phase 9 materially changes that portable contract by formalizing the missing rhythm/mobile-width tokens and renderer/editor bridge variables.
The active source line in this checkpoint therefore now carries:

- `@mdwrk/theme-contract@1.1.0`
- `@mdwrk/ui-tokens@1.2.0`

That is an intentional executed divergence from the earlier frozen forecast, not an accidental version drift.
