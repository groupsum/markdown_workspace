# @mdwrk/testing

- category: shared
- workspace path: `packages/shared/testing`
- version: `1.0.0`
- publishable: yes

## Typed public exports

| Export | Detail |
| --- | --- |
| `.` | `types: ./dist/index.d.ts; import: ./dist/index.js` |
| `./version` | `types: ./dist/version.d.ts; import: ./dist/version.js` |
| `./browser` | `types: ./dist/browser.d.ts; import: ./dist/browser.js` |
| `./timing` | `types: ./dist/timing.d.ts; import: ./dist/timing.js` |
| `./vitest-setup` | `types: ./dist/vitest-setup.d.ts; import: ./dist/vitest-setup.js` |

## README / API docs

- package README: `packages/shared/testing/README.md`
- generated API/reference page: `docs/reference/packages/mdwrk-testing.md`

## Tests / examples / integration fixtures

- `packages/editor/markdown-editor-react/tests/component.test.tsx`
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
    "PHASE_0_CHECKPOINT_SUMMARY.md",
    "PHASE_10_CHECKPOINT_SUMMARY.md",
    "PHASE_11_CHECKPOINT_SUMMARY.md",
    "docs/operations/release-evidence-phase11.md"
  ]
}
```

## Boundary audit

- forbidden app-level source leakage: none detected
