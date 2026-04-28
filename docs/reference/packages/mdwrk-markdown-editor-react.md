# @mdwrk/markdown-editor-react

- category: editor
- workspace path: `packages/editor/markdown-editor-react`
- version: `1.1.0`
- publishable: yes

## Typed public exports

| Export | Detail |
| --- | --- |
| `.` | `types: ./dist/index.d.ts; import: ./dist/index.js` |
| `./version` | `types: ./dist/version.d.ts; import: ./dist/version.js` |
| `./types` | `types: ./dist/types.d.ts; import: ./dist/types.js` |
| `./theme` | `types: ./dist/theme.d.ts; import: ./dist/theme.js` |
| `./styles/default.css` | `./src/styles/default.css` |

## README / API docs

- package README: `packages/editor/markdown-editor-react/README.md`
- generated API/reference page: `docs/reference/packages/mdwrk-markdown-editor-react.md`

## Tests / examples / integration fixtures

- `packages/editor/markdown-editor-react/tests/component.test.tsx`
- `packages/editor/markdown-editor-react/tests/keyboard.test.tsx`
- `packages/editor/markdown-editor-react/tests/run-smoke.mjs`
- `examples/editor-basic/App.tsx`

## Semver / compatibility declarations


```json
{
  "packageVersion": "1.1.0",
  "engines": {
    "node": ">=20 <23"
  },
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "dependencies": {
    "@mdwrk/markdown-editor-core": "^1.1.0",
    "@mdwrk/ui-tokens": "^1.1.0"
  }
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
