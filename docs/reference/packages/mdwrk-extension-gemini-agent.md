# @mdwrk/extension-gemini-agent

- category: extension
- workspace path: `packages/extensions/extension-gemini-agent`
- version: `1.1.0`
- publishable: yes

## Typed public exports

| Export | Detail |
| --- | --- |
| `.` | `types: ./dist/index.d.ts; import: ./dist/index.js` |
| `./version` | `types: ./dist/version.d.ts; import: ./dist/version.js` |
| `./types` | `types: ./dist/types.d.ts; import: ./dist/types.js` |
| `./constants` | `types: ./dist/constants.d.ts; import: ./dist/constants.js` |
| `./manifest` | `types: ./dist/manifest.d.ts; import: ./dist/manifest.js` |
| `./i18n` | `types: ./dist/i18n.d.ts; import: ./dist/i18n.js` |
| `./settings` | `types: ./dist/settings.d.ts; import: ./dist/settings.js` |
| `./context` | `types: ./dist/context.d.ts; import: ./dist/context.js` |
| `./prompt` | `types: ./dist/prompt.d.ts; import: ./dist/prompt.js` |
| `./provider` | `types: ./dist/provider.d.ts; import: ./dist/provider.js` |
| `./service` | `types: ./dist/service.d.ts; import: ./dist/service.js` |
| `./bundled` | `types: ./dist/createGeminiAgentBundledEntry.d.ts; import: ./dist/createGeminiAgentBundledEntry.js` |

## README / API docs

- package README: `packages/extensions/extension-gemini-agent/README.md`
- generated API/reference page: `docs/reference/packages/mdwrk-extension-gemini-agent.md`

## Tests / examples / integration fixtures

- `packages/extensions/extension-gemini-agent/tests/run-smoke.mjs`
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
    "build:deps": "npm run build -w @mdwrk/extension-manifest && npm run build -w @mdwrk/extension-host && npm run build -w @mdwrk/extension-runtime",
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
  "id": "core.gemini-agent",
  "kind": "bundled",
  "capabilities": [
    "workspace.read",
    "editor.read",
    "editor.write",
    "selection.read",
    "settings.read",
    "settings.write",
    "notification.publish",
    "command.invoke",
    "actionRail.register",
    "view.register",
    "network.fetch"
  ],
  "supportedLocales": [
    "en",
    "es"
  ],
  "hasSettingsSchema": true,
  "settingsSections": [
    "core.gemini-agent.settings"
  ],
  "support": {
    "owner": "Markdown Workspace",
    "status": "active",
    "level": "official"
  }
}
```

## Install / configuration guidance

- install path: first-party bundled extension
- bundled in client: yes
- configuration surface: shared settings registry / manifest-backed settings schema
