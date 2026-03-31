# @mdwrk/extension-catalog-hello

- category: extension
- workspace path: `packages/extensions/extension-catalog-hello`
- version: `1.0.1`
- publishable: yes

## Typed public exports

| Export | Detail |
| --- | --- |
| `.` | `types: ./dist/index.d.ts; import: ./dist/index.js` |
| `./manifest` | `types: ./dist/manifest.d.ts; import: ./dist/manifest.js` |
| `./version` | `types: ./dist/version.d.ts; import: ./dist/version.js` |

## README / API docs

- package README: `packages/extensions/extension-catalog-hello/README.md`
- generated API/reference page: `docs/reference/packages/mdwrk-extension-catalog-hello.md`

## Tests / examples / integration fixtures

- `packages/extensions/extension-catalog-hello/tests/integration.mjs`
- `packages/extensions/extension-catalog-hello/tests/run-smoke.mjs`
- `artifacts/extensions/external.catalog-hello/1.0.1`

## Semver / compatibility declarations


```json
{
  "manifestVersion": 1,
  "hostApi": "^1.0.0",
  "runtime": "^1.0.0",
  "app": ">=0.1.0",
  "themeContract": "^1.0.0"
}
```

## Release / checkpoint evidence


```json
{
  "version": "1.0.1",
  "scripts": {
    "build:deps": "npm run build -w @mdwrk/extension-manifest && npm run build -w @mdwrk/extension-host",
    "build": "npm run build:deps && tsc -p tsconfig.json",
    "typecheck": "npm run build:deps && tsc --noEmit -p tsconfig.json",
    "lint": "npm run typecheck",
    "test": "npm run build && node ./tests/run-smoke.mjs && node ./tests/integration.mjs",
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

## Extension manifest summary


```json
{
  "id": "external.catalog-hello",
  "kind": "external",
  "capabilities": [
    "view.register",
    "actionRail.register",
    "notification.publish",
    "settings.read"
  ],
  "supportedLocales": [
    "en"
  ],
  "hasSettingsSchema": true,
  "settingsSections": [],
  "support": {
    "status": "experimental",
    "level": "community",
    "owner": "demo-catalog"
  }
}
```

## Install / configuration guidance

- install path: external signed catalog artifact
- bundled in client: no
- configuration surface: manifest-backed greeting setting
