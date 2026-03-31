# @mdwrk/theme-contract

- category: contract
- workspace path: `packages/contracts/theme-contract`
- version: `1.1.0`
- publishable: yes

## Typed public exports

| Export | Detail |
| --- | --- |
| `.` | `types: ./dist/index.d.ts; import: ./dist/index.js` |
| `./version` | `types: ./dist/version.d.ts; import: ./dist/version.js` |
| `./tokens` | `types: ./dist/tokens.d.ts; import: ./dist/tokens.js` |
| `./classes` | `types: ./dist/classes.d.ts; import: ./dist/classes.js` |
| `./compatibility` | `types: ./dist/compatibility.d.ts; import: ./dist/compatibility.js` |
| `./themes` | `types: ./dist/themes.d.ts; import: ./dist/themes.js` |
| `./bridges` | `types: ./dist/bridges.d.ts; import: ./dist/bridges.js` |

## README / API docs

- package README: `packages/contracts/theme-contract/README.md`
- generated API/reference page: `docs/reference/packages/mdwrk-theme-contract.md`

## Tests / examples / integration fixtures

- `packages/shared/ui-tokens/tests/run-smoke.mjs`
- `artifacts/conformance/latest/phase-9-theme-parity-results.json`
- `packages/extensions/extension-theme-studio/tests/run-smoke.mjs`

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
