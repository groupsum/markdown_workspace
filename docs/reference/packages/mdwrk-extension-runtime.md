# @mdwrk/extension-runtime

- category: extension
- workspace path: `packages/extensions/extension-runtime`
- version: `1.0.1`
- publishable: yes

## Typed public exports

| Export | Detail |
| --- | --- |
| `.` | `types: ./dist/index.d.ts; import: ./dist/index.js` |
| `./version` | `types: ./dist/version.d.ts; import: ./dist/version.js` |
| `./types` | `types: ./dist/types.d.ts; import: ./dist/types.js` |
| `./compatibility` | `types: ./dist/compatibility.d.ts; import: ./dist/compatibility.js` |
| `./registry` | `types: ./dist/registry.d.ts; import: ./dist/registry.js` |
| `./loader` | `types: ./dist/loader.d.ts; import: ./dist/loader.js` |
| `./runtime` | `types: ./dist/runtime.d.ts; import: ./dist/runtime.js` |
| `./storage` | `types: ./dist/storage.d.ts; import: ./dist/storage.js` |
| `./validation` | `types: ./dist/validation.d.ts; import: ./dist/validation.js` |
| `./catalog` | `types: ./dist/catalog.d.ts; import: ./dist/catalog.js` |

## README / API docs

- package README: `packages/extensions/extension-runtime/README.md`
- generated API/reference page: `docs/reference/packages/mdwrk-extension-runtime.md`

## Tests / examples / integration fixtures

- `packages/extensions/extension-runtime/tests/prepare-workspace-links.mjs`
- `packages/extensions/extension-runtime/tests/run-smoke.mjs`
- `packages/extensions/extension-runtime/tests/runtime.test.ts`
- `packages/extensions/extension-catalog-hello/tests/integration.mjs`

## Semver / compatibility declarations


```json
{
  "packageVersion": "1.0.1",
  "engines": {
    "node": ">=20 <23"
  },
  "peerDependencies": null,
  "dependencies": {
    "@mdwrk/extension-host": "^1.0.1",
    "@mdwrk/extension-manifest": "^1.0.0",
    "@mdwrk/theme-contract": "^1.0.0"
  }
}
```

## Release / checkpoint evidence


```json
{
  "version": "1.0.1",
  "scripts": {
    "build:deps": "npm run build -w @mdwrk/extension-manifest && npm run build -w @mdwrk/theme-contract && npm run build -w @mdwrk/extension-host",
    "build": "npm run build:deps && tsc -p tsconfig.json",
    "typecheck": "npm run build:deps && tsc --noEmit -p tsconfig.json",
    "lint": "npm run typecheck",
    "test": "npm run build && node ./tests/prepare-workspace-links.mjs && node ./tests/run-smoke.mjs",
    "prepack": "npm run build"
  },
  "files": [
    "dist",
    "README.md"
  ],
  "phaseArtifacts": [
    "PHASE_0_CHECKPOINT_SUMMARY.md",
    "PHASE_10_CHECKPOINT_SUMMARY.md",
    "PHASE_11_CHECKPOINT_SUMMARY.md",
    "docs/operations/release-evidence-phase11.md"
  ]
}
```

## Boundary audit

- forbidden app-level source leakage: none detected

## Extension manifest summary


_No manifest could be resolved from the package exports._

## Install / configuration guidance

- install path: first-party bundled extension
- bundled in client: yes
- configuration surface: shared settings registry / manifest-backed settings schema
