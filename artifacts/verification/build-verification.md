# MdWrk checkpoint build verification

All commands listed below completed successfully during this checkpoint on 2026-03-26.

## Workspace builds

- `npx tsc -p packages/contracts/extension-manifest/tsconfig.json`
- `npx tsc -p packages/contracts/theme-contract/tsconfig.json`
- `npx tsc -p packages/contracts/extension-host/tsconfig.json`
- `npx tsc -p packages/shared/ui-tokens/tsconfig.json`
- `npx tsc -p packages/shared/icons/tsconfig.json`
- `npx tsc -p packages/shared/i18n/tsconfig.json`
- `npx tsc -p packages/shared/testing/tsconfig.json`
- `npx tsc -p packages/renderer/markdown-renderer-core/tsconfig.json`
- `npx tsc -p packages/renderer/markdown-renderer-react/tsconfig.json`
- `npx tsc -p packages/editor/markdown-editor-core/tsconfig.json`
- `npx tsc -p packages/editor/markdown-editor-react/tsconfig.json`
- `npx tsc -p packages/extensions/extension-runtime/tsconfig.json`
- `npx tsc -p packages/extensions/extension-manager/tsconfig.json`
- `npx tsc -p packages/extensions/extension-gemini-agent/tsconfig.json`
- `npx tsc -p packages/extensions/extension-theme-studio/tsconfig.json`
- `npx tsc -p packages/extensions/extension-catalog-hello/tsconfig.json`
- `cd apps/client && npx tsc -p tsconfig.json`
- `cd apps/client && npx vite build`
- `npm run build:lib -w apps/client`
- `npm run build -w apps/lander`
- `npm run build -w @mdwrk/example-renderer-basic`
- `npm run build -w @mdwrk/example-editor-basic`

## Conformance and release checks

- `npm run validate:manifests`
- `npm run validate:compatibility`
- `npm run validate:boundaries`
- `npm run validate:exports`
- `npm run extension:bundle`
- `npm run extension:sign`
- `npm run validate:extension-artifacts`
- `npm run conformance`
- `npm run ci:package-matrices`
- `npm run pack:packages`
- `npm run release:evidence`

## Observed notes

- `apps/client` application and library builds both succeed, but they write to the same `apps/client/dist/` directory. The library build was run last in this checkpoint so `apps/client/dist/` currently reflects the publishable package output.
- Vite emitted large-chunk warnings for `apps/client` and `apps/lander`, but those warnings did not fail the builds.
- `apps/lander` build also emitted a warning about `eval` usage inside an upstream dependency (`gray-matter/lib/engines.js`). The build still completed successfully.
