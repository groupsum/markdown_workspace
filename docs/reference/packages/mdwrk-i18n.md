# @mdwrk/i18n

- category: shared
- workspace path: `packages/shared/i18n`
- version: `1.1.0`
- publishable: yes

## Typed public exports

| Export | Detail |
| --- | --- |
| `.` | `types: ./dist/index.d.ts; import: ./dist/index.js` |
| `./version` | `types: ./dist/version.d.ts; import: ./dist/version.js` |
| `./types` | `types: ./dist/types.d.ts; import: ./dist/types.js` |
| `./registry` | `types: ./dist/registry.d.ts; import: ./dist/registry.js` |
| `./format` | `types: ./dist/format.d.ts; import: ./dist/format.js` |
| `./loaders` | `types: ./dist/loaders.d.ts; import: ./dist/loaders.js` |

## README / API docs

- package README: `packages/shared/i18n/README.md`
- generated API/reference page: `docs/reference/packages/mdwrk-i18n.md`

## Tests / examples / integration fixtures

- `packages/shared/i18n/tests/run-smoke.mjs`
- `apps/client/tests/phase10-i18n-parity.mjs`
- `packages/extensions/extension-manager/src/i18n.ts`

## Semver / compatibility declarations


```json
{
  "packageVersion": "1.1.0",
  "engines": {
    "node": ">=20 <23"
  },
  "peerDependencies": null,
  "dependencies": null
}
```

## Release / checkpoint evidence


```json
{
  "version": "1.1.0",
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "typecheck": "tsc --noEmit -p tsconfig.json",
    "lint": "npm run typecheck",
    "test": "npm run build && node ./tests/run-smoke.mjs",
    "prepack": "npm run build"
  },
  "files": [
    "dist",
    "README.md"
  ],
  "phaseArtifacts": [
    "docs/current-state/checkpoints/PHASE_0_CHECKPOINT_SUMMARY.md",
    "docs/current-state/checkpoints/PHASE_10_CHECKPOINT_SUMMARY.md",
    "docs/current-state/checkpoints/PHASE_11_CHECKPOINT_SUMMARY.md",
    "docs/operations/release-evidence-phase11.md"
  ]
}
```

## Boundary audit

- forbidden app-level source leakage: none detected
