# @mdwrk/extension-manager

- category: extension
- workspace path: `packages/extensions/extension-manager`
- version: `1.1.0`
- publishable: yes

## Typed public exports

| Export | Detail |
| --- | --- |
| `.` | `types: ./dist/index.d.ts; import: ./dist/index.js` |
| `./version` | `types: ./dist/version.d.ts; import: ./dist/version.js` |
| `./manifest` | `types: ./dist/manifest.d.ts; import: ./dist/manifest.js` |
| `./types` | `types: ./dist/types.d.ts; import: ./dist/types.js` |

## README / API docs

- package README: `packages/extensions/extension-manager/README.md`
- generated API/reference page: `docs/reference/packages/mdwrk-extension-manager.md`

## Tests / examples / integration fixtures

- `packages/extensions/extension-manager/tests/extension-manager.test.tsx`
- `apps/client/src/extensions/runtime/createClientExtensionRegistrationSink.tsx`

## Semver / compatibility declarations


```json
{
  "manifestVersion": 1,
  "hostApi": "^1.0.0",
  "runtime": "^1.0.0",
  "app": ">=1.3.49",
  "themeContract": "^1.0.0"
}
```

## Release / checkpoint evidence


```json
{
  "version": "1.1.0",
  "scripts": {
    "build:deps": "npm run build -w @mdwrk/extension-manifest && npm run build -w @mdwrk/extension-host && npm run build -w @mdwrk/extension-runtime",
    "build": "npm run build:deps && tsc -p tsconfig.json",
    "typecheck": "npm run build:deps && tsc --noEmit -p tsconfig.json",
    "lint": "npm run typecheck",
    "test": "vitest run tests/extension-manager.test.tsx --pool=forks --minWorkers=1 --maxWorkers=1",
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

## Extension manifest summary


```json
{
  "id": "core.extension-manager",
  "kind": "bundled",
  "capabilities": [
    "view.register",
    "actionRail.register",
    "settings.read",
    "settings.write"
  ],
  "supportedLocales": [
    "en",
    "es"
  ],
  "hasSettingsSchema": true,
  "settingsSections": [
    "core.extension-manager.settings"
  ],
  "support": null
}
```

## Install / configuration guidance

- install path: first-party bundled extension
- bundled in client: yes
- configuration surface: shared settings registry / manifest-backed settings schema
