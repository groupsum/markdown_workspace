# @mdwrk/markdown-editor-core

- category: editor
- workspace path: `packages/editor/markdown-editor-core`
- version: `1.1.0`
- publishable: yes

## Typed public exports

| Export | Detail |
| --- | --- |
| `.` | `types: ./dist/index.d.ts; import: ./dist/index.js` |
| `./version` | `types: ./dist/version.d.ts; import: ./dist/version.js` |
| `./types` | `types: ./dist/types.d.ts; import: ./dist/types.js` |
| `./class-names` | `types: ./dist/class-names.d.ts; import: ./dist/class-names.js` |
| `./selection` | `types: ./dist/selection.d.ts; import: ./dist/selection.js` |
| `./transforms` | `types: ./dist/transforms.d.ts; import: ./dist/transforms.js` |
| `./commands` | `types: ./dist/commands.d.ts; import: ./dist/commands.js` |
| `./history` | `types: ./dist/history.d.ts; import: ./dist/history.js` |

## README / API docs

- package README: `packages/editor/markdown-editor-core/README.md`
- generated API/reference page: `docs/reference/packages/mdwrk-markdown-editor-core.md`

## Tests / examples / integration fixtures

- `packages/editor/markdown-editor-core/tests/commands.test.ts`
- `packages/editor/markdown-editor-core/tests/history.test.ts`
- `packages/editor/markdown-editor-core/tests/roundtrip.test.ts`
- `packages/editor/markdown-editor-core/tests/run-smoke.mjs`
- `packages/editor/markdown-editor-core/tests/selection.test.ts`
- `packages/editor/markdown-editor-core/tests/transforms.test.ts`
- `examples/editor-basic/App.tsx`

## Semver / compatibility declarations


```json
{
  "packageVersion": "1.1.0",
  "engines": {
    "node": ">=20 <23"
  },
  "peerDependencies": null,
  "dependencies": {}
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
    "test": "node ./tests/run-smoke.mjs",
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
