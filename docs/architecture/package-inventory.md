# Package inventory

Date: 2026-03-27

This inventory reflects the current workspace package topology in the v2 monorepo checkpoint.
It is descriptive inventory only.
For release ownership, SemVer policy, compatibility declarations, and promotion paths, use `docs/operations/release-groups.md`.

## Applications

| Path | Package name | Kind | Publishable | Status |
|---|---|---|---|---|
| `apps/client/` | `@mdwrk/mdwrkspace` | app + published package | yes | implemented |
| `apps/lander/` | `@mdwrk/lander` | app | no | implemented |

## Contract packages

| Path | Package name | Kind | Publishable | Status |
|---|---|---|---|---|
| `packages/contracts/extension-manifest/` | `@mdwrk/extension-manifest` | contract | yes | implemented |
| `packages/contracts/extension-host/` | `@mdwrk/extension-host` | contract | yes | implemented |
| `packages/contracts/theme-contract/` | `@mdwrk/theme-contract` | contract | yes | implemented |

## Shared packages

| Path | Package name | Kind | Publishable | Status |
|---|---|---|---|---|
| `packages/shared/ui-tokens/` | `@mdwrk/ui-tokens` | shared | yes | implemented |
| `packages/shared/icons/` | `@mdwrk/icons` | shared | yes | implemented |
| `packages/shared/i18n/` | `@mdwrk/i18n` | shared | yes | implemented |
| `packages/shared/testing/` | `@mdwrk/testing` | shared | yes | implemented |

## Renderer packages

| Path | Package name | Kind | Publishable | Status |
|---|---|---|---|---|
| `packages/renderer/markdown-renderer-core/` | `@mdwrk/markdown-renderer-core` | renderer | yes | implemented |
| `packages/renderer/markdown-renderer-react/` | `@mdwrk/markdown-renderer-react` | renderer | yes | implemented |

## Editor packages

| Path | Package name | Kind | Publishable | Status |
|---|---|---|---|---|
| `packages/editor/markdown-editor-core/` | `@mdwrk/markdown-editor-core` | editor | yes | implemented |
| `packages/editor/markdown-editor-react/` | `@mdwrk/markdown-editor-react` | editor | yes | implemented |

## Extension packages

| Path | Package name | Kind | Publishable | Status |
|---|---|---|---|---|
| `packages/extensions/extension-runtime/` | `@mdwrk/extension-runtime` | extension runtime | yes | implemented |
| `packages/extensions/extension-manager/` | `@mdwrk/extension-manager` | first-party extension | yes | implemented |
| `packages/extensions/extension-gemini-agent/` | `@mdwrk/extension-gemini-agent` | first-party extension | yes | implemented |
| `packages/extensions/extension-theme-studio/` | `@mdwrk/extension-theme-studio` | first-party extension | yes | implemented |
| `packages/extensions/extension-catalog-hello/` | `@mdwrk/extension-catalog-hello` | sample external extension | yes | implemented |

## Example packages

| Path | Package name | Kind | Publishable | Status |
|---|---|---|---|---|
| `examples/editor-basic/` | `@mdwrk/example-editor-basic` | example | no | implemented |
| `examples/renderer-basic/` | `@mdwrk/example-renderer-basic` | example | no | implemented |

## Inventory observations

- the repo contains implemented contract packages, shared primitive packages, renderer packages, editor packages, extension runtime and first-party extension packages, and example/demo packages
- both apps consume shared packages rather than maintaining completely separate renderer/editor/token stacks
- the client app consumes the extension runtime and bundled extension packages through host-safe registration adapters
- the workspace is already structurally suitable for the Phase 1 release-train freeze and later strict-conformance phases
