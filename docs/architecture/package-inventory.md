# Package inventory

This inventory reflects the current workspace package topology and implementation status.

## Applications

| Path | Package name | Kind | Status |
|---|---|---|---|
| `apps/client/` | `@swarmauri/markspace` | app + published package | implemented |
| `apps/lander/` | `markspace---local-first-markdown-workspace` | app | implemented |

## Contract packages

| Path | Package name | Kind | Status |
|---|---|---|---|
| `packages/contracts/extension-manifest/` | `@markdown-workspace/extension-manifest` | contract | implemented |
| `packages/contracts/extension-host/` | `@markdown-workspace/extension-host` | contract | implemented |
| `packages/contracts/theme-contract/` | `@markdown-workspace/theme-contract` | contract | implemented |

## Shared packages

| Path | Package name | Kind | Status |
|---|---|---|---|
| `packages/shared/ui-tokens/` | `@markdown-workspace/ui-tokens` | shared | implemented |
| `packages/shared/icons/` | `@markdown-workspace/icons` | shared | implemented |
| `packages/shared/i18n/` | `@markdown-workspace/i18n` | shared | implemented |
| `packages/shared/testing/` | `@markdown-workspace/testing` | shared | implemented |

## Renderer packages

| Path | Package name | Kind | Status |
|---|---|---|---|
| `packages/renderer/markdown-renderer-core/` | `@markdown-workspace/markdown-renderer-core` | renderer | implemented |
| `packages/renderer/markdown-renderer-react/` | `@markdown-workspace/markdown-renderer-react` | renderer | implemented |

## Editor packages

| Path | Package name | Kind | Status |
|---|---|---|---|
| `packages/editor/markdown-editor-core/` | `@markdown-workspace/markdown-editor-core` | editor | implemented |
| `packages/editor/markdown-editor-react/` | `@markdown-workspace/markdown-editor-react` | editor | implemented |

## Extension packages

| Path | Package name | Kind | Status |
|---|---|---|---|
| `packages/extensions/extension-runtime/` | `@markdown-workspace/extension-runtime` | extension runtime | implemented |
| `packages/extensions/extension-manager/` | `@markdown-workspace/extension-manager` | first-party extension | implemented |
| `packages/extensions/extension-gemini-agent/` | `@markdown-workspace/extension-gemini-agent` | first-party extension | implemented |
| `packages/extensions/extension-theme-studio/` | `@markdown-workspace/extension-theme-studio` | first-party extension | implemented |
| `packages/extensions/extension-catalog-hello/` | `@demo-markdown-workspace/extension-catalog-hello` | sample external extension | implemented |

## Inventory observations

- the repo now has implemented contract packages, shared primitive packages, renderer packages, editor packages, the standalone extension runtime package, first-party bundled extension packages, and a sample third-party external extension package
- both applications consume the shared renderer packages rather than maintaining two independent renderer implementations
- the client editing surface consumes the shared editor package family rather than maintaining app-local source-mode editor logic only
- the client now consumes both `@markdown-workspace/extension-runtime` and `@markdown-workspace/extension-manager` while keeping host-specific registration adapters under `apps/client/src/extensions/`
- the shared i18n package supports package-local locale loader registration and locale fallback chains
- the theme contract and shared UI token package expose renderer/editor bridge definitions and bridge CSS generation helpers
- packaged Gemini Agent is implemented
- packaged Theme Studio is implemented
- the runtime now supports external catalog entries, signed manifest verification, integrity-checked ESM artifact installation, update, removal, and cache rehydration
- the sample external extension package is used to prove the formal third-party distribution path and to generate catalog/signature/integrity evidence under `artifacts/extensions/`
