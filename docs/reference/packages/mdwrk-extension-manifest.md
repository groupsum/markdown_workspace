# @mdwrk/extension-manifest

- category: contract
- workspace path: `packages/contracts/extension-manifest`
- version: `1.0.0`
- publishable: yes

## Typed public exports

| Export | Detail |
| --- | --- |
| `.` | `types: ./dist/index.d.ts; import: ./dist/index.js` |
| `./version` | `types: ./dist/version.d.ts; import: ./dist/version.js` |
| `./manifest` | `types: ./dist/manifest.d.ts; import: ./dist/manifest.js` |
| `./settings` | `types: ./dist/settings.d.ts; import: ./dist/settings.js` |
| `./capabilities` | `types: ./dist/capabilities.d.ts; import: ./dist/capabilities.js` |
| `./compatibility` | `types: ./dist/compatibility.d.ts; import: ./dist/compatibility.js` |
| `./contributions` | `types: ./dist/contributions.d.ts; import: ./dist/contributions.js` |
| `./entry` | `types: ./dist/entry.d.ts; import: ./dist/entry.js` |
| `./i18n` | `types: ./dist/i18n.d.ts; import: ./dist/i18n.js` |
| `./icon` | `types: ./dist/icon.d.ts; import: ./dist/icon.js` |
| `./integrity` | `types: ./dist/integrity.d.ts; import: ./dist/integrity.js` |
| `./support` | `types: ./dist/support.d.ts; import: ./dist/support.js` |
| `./catalog` | `types: ./dist/catalog.d.ts; import: ./dist/catalog.js` |
| `./signature` | `types: ./dist/signature.d.ts; import: ./dist/signature.js` |

## README / API docs

- package README: `packages/contracts/extension-manifest/README.md`
- generated API/reference page: `docs/reference/packages/mdwrk-extension-manifest.md`

## Tests / examples / integration fixtures

- `packages/extensions/extension-catalog-hello/tests/run-smoke.mjs`
- `packages/extensions/extension-gemini-agent/tests/run-smoke.mjs`
- `packages/extensions/extension-manager/tests/extension-manager.test.tsx`

## Semver / compatibility declarations


```json
{
  "packageVersion": "1.0.0",
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
  "version": "1.0.0",
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
    "docs/current-state/checkpoints/PHASE_0_CHECKPOINT_SUMMARY.md",
    "docs/current-state/checkpoints/PHASE_10_CHECKPOINT_SUMMARY.md",
    "docs/current-state/checkpoints/PHASE_11_CHECKPOINT_SUMMARY.md",
    "docs/operations/release-evidence-phase11.md"
  ]
}
```

## Boundary audit

- forbidden app-level source leakage: none detected
