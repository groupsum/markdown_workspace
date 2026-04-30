# @mdwrk/ui-tokens

- category: shared
- workspace path: `packages/shared/ui-tokens`
- version: `1.2.0`
- publishable: yes

## Typed public exports

| Export | Detail |
| --- | --- |
| `.` | `types: ./dist/index.d.ts; import: ./dist/index.js` |
| `./version` | `types: ./dist/version.d.ts; import: ./dist/version.js` |
| `./tokens` | `types: ./dist/tokens.d.ts; import: ./dist/tokens.js` |
| `./classes` | `types: ./dist/classes.d.ts; import: ./dist/classes.js` |
| `./theme-map` | `types: ./dist/theme-map.d.ts; import: ./dist/theme-map.js` |
| `./styles/index.css` | `./src/styles/index.css` |
| `./styles/root.css` | `./src/styles/root.css` |
| `./styles/markdown.css` | `./src/styles/markdown.css` |

## README / API docs

- package README: `packages/shared/ui-tokens/README.md`
- generated API/reference page: `docs/reference/packages/mdwrk-ui-tokens.md`

## Tests / examples / integration fixtures

- `packages/shared/ui-tokens/tests/prepare-workspace-links.mjs`
- `packages/shared/ui-tokens/tests/run-smoke.mjs`
- `examples/editor-basic/App.tsx`
- `examples/renderer-basic/App.tsx`

## Semver / compatibility declarations


```json
{
  "packageVersion": "1.2.0",
  "engines": {
    "node": ">=20 <23"
  },
  "peerDependencies": null,
  "dependencies": {
    "@mdwrk/theme-contract": "^1.1.0"
  }
}
```

## Release / checkpoint evidence


```json
{
  "version": "1.2.0",
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "typecheck": "tsc --noEmit -p tsconfig.json",
    "lint": "npm run typecheck",
    "test": "npm run build && node ./tests/prepare-workspace-links.mjs && node ./tests/run-smoke.mjs",
    "prepack": "npm run build"
  },
  "files": [
    "dist",
    "src/styles",
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
