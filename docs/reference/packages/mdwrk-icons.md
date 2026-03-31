# @mdwrk/icons

- category: shared
- workspace path: `packages/shared/icons`
- version: `1.0.0`
- publishable: yes

## Typed public exports

| Export | Detail |
| --- | --- |
| `.` | `types: ./dist/index.d.ts; import: ./dist/index.js` |
| `./version` | `types: ./dist/version.d.ts; import: ./dist/version.js` |
| `./catalog` | `types: ./dist/catalog.d.ts; import: ./dist/catalog.js` |

## README / API docs

- package README: `packages/shared/icons/README.md`
- generated API/reference page: `docs/reference/packages/mdwrk-icons.md`

## Tests / examples / integration fixtures

- `apps/client/src/shell/iconRenderer.tsx`
- `packages/extensions/extension-manager/src/manifest.ts`

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
    "PHASE_0_CHECKPOINT_SUMMARY.md",
    "PHASE_10_CHECKPOINT_SUMMARY.md",
    "PHASE_11_CHECKPOINT_SUMMARY.md",
    "docs/operations/release-evidence-phase11.md"
  ]
}
```

## Boundary audit

- forbidden app-level source leakage: none detected
