# Extension manifest schema

## Status

Normative for the target extension platform.

## Sources of truth

- TypeScript contract package: `@markdown-workspace/extension-manifest`
- Machine-readable schema: `docs/conformance/schemas/extension-manifest.schema.json`

## Purpose

This document defines the required structure for publishable Markdown Workspace extension manifests.

## High-level rules

- every extension package must export exactly one primary manifest
- manifest ids are stable dot-separated identifiers
- manifests are versioned independently from package versions
- all user-visible labels must be localizable
- every extension must declare capabilities explicitly
- every extension must provide an icon descriptor
- compatibility must be explicit
- contributions are structured objects, not ad hoc string arrays
- keyed labels are preferred for all manifest-exposed UI strings
- locale catalogs should use message keys namespaced to the extension id

## Top-level fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `manifestVersion` | integer | yes | schema version for the manifest structure |
| `id` | string | yes | stable extension id, e.g. `core.gemini-agent` |
| `packageName` | string | yes | npm package name |
| `version` | string | yes | semver package/extension version |
| `displayName` | `I18nLabel` | yes | localized human-facing name |
| `description` | `I18nLabel` | yes | localized summary |
| `kind` | enum | yes | `bundled` or `external` |
| `publisher` | string | no | organization or author |
| `license` | string | no | SPDX expression |
| `homepage` | string | no | documentation page |
| `repository` | string | no | source repository URL |
| `categories` | string[] | no | discovery categories |
| `keywords` | string[] | no | package keywords |
| `icon` | `ExtensionIcon` | yes | extension icon metadata |
| `enabledByDefault` | boolean | yes | default enabled state |
| `capabilities` | `ExtensionCapability[]` | yes | declared permissions/capabilities |
| `compatibility` | `ExtensionCompatibility` | yes | host/runtime compatibility declaration |
| `entry` | `ExtensionEntrypoint` | yes | runtime entry module/export declaration |
| `contributions` | `ExtensionContributions` | yes | commands/views/components/rail/settings declarations |
| `settingsSchema` | `ExtensionSettingsSchema` | no | required when extension has configurable settings |
| `i18n` | `ExtensionI18nDefinition` | no | locale metadata |
| `distribution` | `ExtensionDistribution` | no | required for externally installable bundles |
| `integrity` | `ExtensionIntegrity` | no | artifact integrity metadata |
| `support` | `ExtensionSupportDeclaration` | no | support/lifecycle metadata |

## Important nested types

### `I18nLabel`

```json
{
  "key": "core.gemini-agent.manifest.displayName",
  "defaultMessage": "Gemini Agent",
  "description": "Name shown in the action rail and extension manager"
}
```

Authoring rules:
- prefer stable `key` values for all manifest-exposed labels
- use the extension id as the namespace prefix for keys
- keep `defaultMessage` usable as a fallback when catalogs are unavailable

### `ExtensionI18nDefinition`

```json
{
  "defaultLocale": "en",
  "supportedLocales": ["en", "es"],
  "catalogs": [
    { "locale": "en", "path": "./locales/en.js" },
    { "locale": "es", "path": "./locales/es.js" }
  ]
}
```

This block describes the package-local locale assets. Runtime loading is performed through the host i18n APIs rather than by ad hoc extension-side global state.

### `ExtensionIcon`

Allowed shapes:

```json
{ "kind": "lucide", "name": "Bot" }
```

```json
{ "kind": "svg", "svg": "<svg ...>...</svg>" }
```

```json
{ "kind": "asset", "path": "./assets/icon.svg" }
```

### `ExtensionCompatibility`

```json
{
  "manifestVersion": 1,
  "hostApi": "^1.0.0",
  "runtime": "^1.0.0",
  "app": ">=0.1.0 <1.0.0",
  "themeContract": "^1.0.0"
}
```

### `ExtensionEntrypoint`

```json
{
  "module": "./dist/index.js",
  "export": "extension"
}
```

### `ExtensionContributions`

Every contribution collection is an array of objects:

```json
{
  "commands": [
    {
      "id": "gemini.open",
      "title": {
        "key": "core.gemini-agent.commands.open.title",
        "defaultMessage": "Open Gemini"
      }
    }
  ],
  "views": [
    {
      "id": "core.gemini-agent.view",
      "title": {
        "key": "core.gemini-agent.views.main.title",
        "defaultMessage": "Gemini Agent"
      },
      "location": "panel"
    }
  ],
  "components": [],
  "actionRail": [],
  "settingsSections": []
}
```

## Capabilities enum

Canonical capability values:
- `workspace.read`
- `workspace.write`
- `editor.read`
- `editor.write`
- `selection.read`
- `settings.read`
- `settings.write`
- `theme.read`
- `theme.write`
- `command.invoke`
- `network.fetch`
- `notification.publish`
- `actionRail.register`
- `view.register`
- `component.register`

## Field-by-field authoring guidance

### `displayName` and `description`
These are mandatory localized labels and should never be plain unstructured strings in the manifest.

### `capabilities`
Declare the minimum capabilities the extension requires. Do not over-request.

### `compatibility`
This is how the runtime decides whether the extension can activate safely.

### `contributions`
These are declarative metadata about what the extension contributes. Runtime implementation is registered through the host context.

### `settingsSchema`
Use when the extension exposes user- or workspace-configurable behavior.

### `i18n`
Use when the extension ships package-local locale catalogs.
The recommended runtime path is:
1. declare supported locales in the manifest
2. expose locale loaders from the package
3. call `context.registerLocaleCatalogLoader(...)` during activation
4. call `context.host.i18n.ensureLocale()` before rendering localized UI

### `distribution`
Use for externally installable extension artifacts.

### `support`
Use to declare stability/support posture such as `experimental`, `active`, or `deprecated`.

## Example manifest

```json
{
  "manifestVersion": 1,
  "id": "core.gemini-agent",
  "packageName": "@markdown-workspace/extension-gemini-agent",
  "version": "0.1.0",
  "displayName": {
    "key": "core.gemini-agent.manifest.displayName",
    "defaultMessage": "Gemini Agent",
    "description": "Extension name"
  },
  "description": {
    "key": "core.gemini-agent.manifest.description",
    "defaultMessage": "AI assistant workflows for the markdown workspace",
    "description": "Extension summary"
  },
  "kind": "bundled",
  "publisher": "Markdown Workspace",
  "license": "Apache-2.0",
  "icon": {
    "kind": "lucide",
    "name": "Bot"
  },
  "enabledByDefault": true,
  "capabilities": [
    "workspace.read",
    "editor.read",
    "selection.read",
    "network.fetch",
    "settings.read",
    "settings.write",
    "view.register",
    "actionRail.register"
  ],
  "compatibility": {
    "manifestVersion": 1,
    "hostApi": "^1.0.0",
    "runtime": "^1.0.0",
    "app": ">=0.1.0 <1.0.0",
    "themeContract": "^1.0.0"
  },
  "entry": {
    "module": "./dist/index.js",
    "export": "extension"
  },
  "i18n": {
    "defaultLocale": "en",
    "supportedLocales": ["en", "es"]
  },
  "contributions": {
    "commands": [
      {
        "id": "gemini.open",
        "title": {
          "key": "core.gemini-agent.commands.open.title",
          "defaultMessage": "Open Gemini"
        }
      }
    ],
    "views": [
      {
        "id": "core.gemini-agent.view",
        "title": {
          "key": "core.gemini-agent.views.main.title",
          "defaultMessage": "Gemini Agent"
        },
        "location": "panel"
      }
    ],
    "components": [],
    "actionRail": [
      {
        "id": "core.gemini-agent.rail",
        "title": {
          "key": "core.gemini-agent.rail.title",
          "defaultMessage": "Gemini"
        },
        "icon": {
          "kind": "lucide",
          "name": "Bot"
        },
        "group": "assistant",
        "target": {
          "kind": "view",
          "viewId": "core.gemini-agent.view"
        }
      }
    ],
    "settingsSections": [
      {
        "id": "core.gemini-agent.settings",
        "title": {
          "key": "core.gemini-agent.settings.title",
          "defaultMessage": "Gemini Agent"
        }
      }
    ]
  }
}
```
