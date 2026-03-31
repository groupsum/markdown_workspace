# @mdwrk/mdwrkspace

- category: app
- workspace path: `apps/client`
- version: `1.4.0`
- publishable: yes

## Typed public exports

| Export | Detail |
| --- | --- |
| `.` | `import: ./dist/mdwrkspace.js` |

## README / API docs

- package README: `apps/client/README.md`
- generated API/reference page: `docs/reference/apps/mdwrk-mdwrkspace.md`

## Tests / examples / integration fixtures

- `apps/client/tests/phase10-i18n-parity.mjs`
- `apps/client/tests/phase11-package-evidence.mjs`
- `apps/client/tests/phase6-preview-export-policy.mjs`
- `apps/client/tests/phase7-shell-parity.mjs`
- `apps/client/tests/phase7-shell-parity.test.tsx`
- `apps/client/tests/phase8-settings-data-git-parity.mjs`
- `apps/client/tests/phase9-theme-parity.mjs`
- `docs/apps/mdwrkspace-app.md`

## Semver / compatibility declarations


```json
{
  "packageVersion": "1.4.0",
  "engines": {
    "node": ">=20 <23",
    "npm": ">=10"
  },
  "peerDependencies": null,
  "dependencies": {
    "@mdwrk/extension-gemini-agent": "^1.1.0",
    "@mdwrk/extension-host": "^1.0.1",
    "@mdwrk/extension-manager": "^1.1.0",
    "@mdwrk/extension-manifest": "^1.0.0",
    "@mdwrk/extension-runtime": "^1.0.1",
    "@mdwrk/i18n": "^1.1.0",
    "@mdwrk/icons": "^1.0.0",
    "@mdwrk/markdown-editor-react": "^1.1.0",
    "@mdwrk/markdown-renderer-core": "^1.1.0",
    "@mdwrk/markdown-renderer-react": "^1.1.0",
    "@mdwrk/theme-contract": "^1.0.0",
    "@mdwrk/ui-tokens": "^1.1.0",
    "jszip": "^3.10.1",
    "lucide-react": "^0.475.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-syntax-highlighter": "^15.6.1",
    "@mdwrk/extension-theme-studio": "^1.1.0"
  }
}
```

## Release / checkpoint evidence


```json
{
  "version": "1.4.0",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "build:lib": "tsc && vite build --config vite.lib.config.ts",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "typecheck": "tsc --noEmit -p tsconfig.json",
    "lint": "npm run typecheck",
    "prepack": "npm run build:lib"
  },
  "files": [
    "dist"
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

## Application reference docs

- config surface doc: `docs/apps/mdwrkspace-app.md`
- dependency boundary map: `docs/reference/package-boundary-map.md`
- deploy / release doc: `docs/apps/mdwrkspace-app.md`
- conformance record: `docs/conformance/package-documentation-phase11.md`
- support / ownership: first-party / repository-primary application host (repository core maintainers)
