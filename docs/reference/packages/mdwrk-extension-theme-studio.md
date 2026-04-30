# @mdwrk/extension-theme-studio

- category: extension
- workspace path: `packages/extensions/extension-theme-studio`
- version: `1.1.0`
- publishable: yes

## Typed public exports

| Export | Detail |
| --- | --- |
| `.` | `types: ./dist/index.d.ts; import: ./dist/index.js` |
| `./version` | `types: ./dist/version.d.ts; import: ./dist/version.js` |
| `./constants` | `types: ./dist/constants.d.ts; import: ./dist/constants.js` |
| `./manifest` | `types: ./dist/manifest.d.ts; import: ./dist/manifest.js` |
| `./settings` | `types: ./dist/settings.d.ts; import: ./dist/settings.js` |
| `./service` | `types: ./dist/service.d.ts; import: ./dist/service.js` |
| `./types` | `types: ./dist/types.d.ts; import: ./dist/types.js` |
| `./exports` | `types: ./dist/export.d.ts; import: ./dist/export.js` |
| `./relationships` | `types: ./dist/relationship.d.ts; import: ./dist/relationship.js` |
| `./bundled` | `types: ./dist/createThemeStudioBundledEntry.d.ts; import: ./dist/createThemeStudioBundledEntry.js` |

## README / API docs

- package README: `packages/extensions/extension-theme-studio/README.md`
- generated API/reference page: `docs/reference/packages/mdwrk-extension-theme-studio.md`

## Tests / examples / integration fixtures

- `packages/extensions/extension-theme-studio/tests/run-smoke.mjs`
- `apps/client/src/extensions/runtime/bundled/index.ts`

## Semver / compatibility declarations


```json
{
  "manifestVersion": 1,
  "hostApi": "^1.0.0",
  "runtime": "^1.0.0",
  "app": ">=1.3.49",
  "themeContract": "^1.0.0",
  "renderer": "^1.0.0",
  "editor": "^1.0.0"
}
```

## Release / checkpoint evidence


```json
{
  "version": "1.1.0",
  "scripts": {
    "build:deps": "npm run build -w @mdwrk/extension-manifest && npm run build -w @mdwrk/extension-host && npm run build -w @mdwrk/theme-contract && npm run build -w @mdwrk/ui-tokens && npm run build -w @mdwrk/markdown-renderer-react && npm run build -w @mdwrk/markdown-editor-react && npm run build -w @mdwrk/extension-runtime",
    "build": "npm run build:deps && tsc -p tsconfig.json",
    "typecheck": "npm run build:deps && tsc --noEmit -p tsconfig.json",
    "lint": "npm run typecheck",
    "test": "npm run build && node ./tests/run-smoke.mjs",
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
  "id": "core.theme-studio",
  "kind": "bundled",
  "capabilities": [
    "theme.read",
    "theme.write",
    "settings.read",
    "settings.write",
    "notification.publish",
    "view.register",
    "actionRail.register"
  ],
  "supportedLocales": [
    "en",
    "es"
  ],
  "hasSettingsSchema": true,
  "settingsSections": [
    "core.theme-studio.settings"
  ],
  "support": null
}
```

## Install / configuration guidance

- install path: first-party bundled extension
- bundled in client: yes
- configuration surface: shared settings registry / manifest-backed settings schema
