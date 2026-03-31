# @mdwrk/markdown-renderer-react

- category: renderer
- workspace path: `packages/renderer/markdown-renderer-react`
- version: `1.1.0`
- publishable: yes

## Typed public exports

| Export | Detail |
| --- | --- |
| `.` | `types: ./dist/index.d.ts; import: ./dist/index.js` |
| `./version` | `types: ./dist/version.d.ts; import: ./dist/version.js` |
| `./types` | `types: ./dist/types.d.ts; import: ./dist/types.js` |
| `./theme` | `types: ./dist/theme.d.ts; import: ./dist/theme.js` |
| `./server` | `types: ./dist/server.d.ts; import: ./dist/server.js` |
| `./styles/default.css` | `./src/styles/default.css` |

## README / API docs

- package README: `packages/renderer/markdown-renderer-react/README.md`
- generated API/reference page: `docs/reference/packages/mdwrk-markdown-renderer-react.md`

## Tests / examples / integration fixtures

- `packages/renderer/markdown-renderer-react/tests/component.test.tsx`
- `packages/renderer/markdown-renderer-react/tests/gfm-surface.mjs`
- `packages/renderer/markdown-renderer-react/tests/optional-profile-surface.mjs`
- `packages/renderer/markdown-renderer-react/tests/preview-export-policy.mjs`
- `packages/renderer/markdown-renderer-react/tests/run-smoke.mjs`
- `examples/renderer-basic/App.tsx`
- `apps/client/tests/phase6-preview-export-policy.mjs`

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
    "@mdwrk/markdown-renderer-core": "^1.1.0",
    "@mdwrk/ui-tokens": "^1.0.1"
  }
}
```

## Release / checkpoint evidence


```json
{
  "version": "1.1.0",
  "scripts": {
    "build": "node -e \"console.log('dist is committed in this checkpoint')\"",
    "typecheck": "node -e \"console.log('typecheck deferred in this checkpoint')\"",
    "lint": "node -e \"console.log('lint deferred in this checkpoint')\"",
    "test": "node ./tests/gfm-surface.mjs && node ./tests/optional-profile-surface.mjs && node ./tests/preview-export-policy.mjs && node ./tests/run-smoke.mjs",
    "prepack": "node -e \"console.log('prepack uses committed dist')\"",
    "test:optional-profiles": "node ./tests/optional-profile-surface.mjs"
  },
  "files": [
    "dist",
    "src/styles",
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
