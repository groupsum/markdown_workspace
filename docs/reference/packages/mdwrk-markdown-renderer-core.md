# @mdwrk/markdown-renderer-core

- category: renderer
- workspace path: `packages/renderer/markdown-renderer-core`
- version: `1.1.0`
- publishable: yes

## Typed public exports

| Export | Detail |
| --- | --- |
| `.` | `types: ./dist/index.d.ts; import: ./dist/index.js` |
| `./version` | `types: ./dist/version.d.ts; import: ./dist/version.js` |
| `./types` | `types: ./dist/types.d.ts; import: ./dist/types.js` |
| `./class-names` | `types: ./dist/class-names.d.ts; import: ./dist/class-names.js` |
| `./slug` | `types: ./dist/slug.d.ts; import: ./dist/slug.js` |
| `./frontmatter` | `types: ./dist/frontmatter.d.ts; import: ./dist/frontmatter.js` |
| `./headings` | `types: ./dist/headings.d.ts; import: ./dist/headings.js` |
| `./pipeline` | `types: ./dist/pipeline.d.ts; import: ./dist/pipeline.js` |
| `./html` | `types: ./dist/html.d.ts; import: ./dist/html.js` |
| `./engine` | `types: ./dist/engine.d.ts; import: ./dist/engine.js` |

## README / API docs

- package README: `packages/renderer/markdown-renderer-core/README.md`
- generated API/reference page: `docs/reference/packages/mdwrk-markdown-renderer-core.md`

## Tests / examples / integration fixtures

- `packages/renderer/markdown-renderer-core/tests/commonmark-core-corpus.mjs`
- `packages/renderer/markdown-renderer-core/tests/generate-phase2-golden.mjs`
- `packages/renderer/markdown-renderer-core/tests/gfm-default-profile.mjs`
- `packages/renderer/markdown-renderer-core/tests/html.test.ts`
- `packages/renderer/markdown-renderer-core/tests/negative-cases.mjs`
- `packages/renderer/markdown-renderer-core/tests/optional-profiles.mjs`
- `packages/renderer/markdown-renderer-core/tests/preview-export-policy.mjs`
- `packages/renderer/markdown-renderer-core/tests/run-smoke.mjs`
- `examples/renderer-basic/App.tsx`

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
    "build": "node -e \"console.log('dist is committed in this checkpoint')\"",
    "typecheck": "node -e \"console.log('typecheck deferred in this checkpoint')\"",
    "lint": "node -e \"console.log('lint deferred in this checkpoint')\"",
    "test": "node ./tests/run-smoke.mjs && node ./tests/commonmark-core-corpus.mjs && node ./tests/gfm-default-profile.mjs && node ./tests/optional-profiles.mjs && node ./tests/preview-export-policy.mjs && node ./tests/negative-cases.mjs",
    "prepack": "node -e \"console.log('prepack uses committed dist')\"",
    "test:gfm": "node ./tests/gfm-default-profile.mjs",
    "test:optional-profiles": "node ./tests/optional-profiles.mjs"
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
