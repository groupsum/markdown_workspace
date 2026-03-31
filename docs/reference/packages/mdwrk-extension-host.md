# @mdwrk/extension-host

- category: contract
- workspace path: `packages/contracts/extension-host`
- version: `1.0.1`
- publishable: yes

## Typed public exports

| Export | Detail |
| --- | --- |
| `.` | `types: ./dist/index.d.ts; import: ./dist/index.js` |
| `./version` | `types: ./dist/version.d.ts; import: ./dist/version.js` |
| `./primitives` | `types: ./dist/primitives.d.ts; import: ./dist/primitives.js` |
| `./registration` | `types: ./dist/registration.d.ts; import: ./dist/registration.js` |
| `./host` | `types: ./dist/host.d.ts; import: ./dist/host.js` |
| `./context` | `types: ./dist/context.d.ts; import: ./dist/context.js` |
| `./lifecycle` | `types: ./dist/lifecycle.d.ts; import: ./dist/lifecycle.js` |

## README / API docs

- package README: `packages/contracts/extension-host/README.md`
- generated API/reference page: `docs/reference/packages/mdwrk-extension-host.md`

## Tests / examples / integration fixtures

- `packages/extensions/extension-runtime/tests/runtime.test.ts`
- `packages/extensions/extension-gemini-agent/tests/run-smoke.mjs`
- `packages/extensions/extension-theme-studio/tests/run-smoke.mjs`

## Semver / compatibility declarations


```json
{
  "packageVersion": "1.0.1",
  "engines": {
    "node": ">=20 <23"
  },
  "peerDependencies": null,
  "dependencies": {
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
    "build:deps": "npm run build -w @mdwrk/extension-manifest && npm run build -w @mdwrk/theme-contract",
    "build": "npm run build:deps && tsc -p tsconfig.json",
    "typecheck": "npm run build:deps && tsc --noEmit -p tsconfig.json",
    "lint": "npm run typecheck",
    "test": "npm run typecheck",
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
