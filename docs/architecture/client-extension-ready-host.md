# Client extension-ready host

## Purpose

Phase 6 restructures `apps/client` so the client shell itself uses the same registries and host-safe abstractions that future extension packages will target.

This phase does **not** implement the standalone `@markdown-workspace/extension-runtime` package yet. It creates the application-side host surfaces required before that package can be introduced.

## Implemented internal layout

The client now contains three new internal areas:

- `apps/client/src/app/`
- `apps/client/src/shell/`
- `apps/client/src/features/`

### `src/app/`
Owns bootstrap-time composition and runtime providers.

Key files:
- `src/app/AppRoot.tsx`
- `src/app/runtime/ClientRuntimeContext.tsx`
- `src/app/runtime/clientRuntimeTypes.ts`
- `src/app/runtime/useCoreSurfaceRegistrations.tsx`
- `src/app/runtime/useHostKeyboardShortcuts.ts`

### `src/shell/`
Owns registry-driven shell surfaces.

Key files:
- `src/shell/AppShell.tsx`
- `src/shell/ActionRailHost.tsx`
- `src/shell/CommandPaletteView.tsx`
- `src/shell/SettingsView.tsx`
- `src/shell/ViewLayerHost.tsx`
- `src/shell/iconRenderer.tsx`

### `src/features/`
Owns reusable host-side service primitives.

Implemented feature areas:
- `commands/`
- `views/`
- `action-rail/`
- `settings/`
- `i18n/`
- `notifications/`
- `diagnostics/`
- `editor/`
- `common/`

## Runtime/provider split

The legacy `App.tsx` entry now delegates to `src/app/AppRoot.tsx`.

`AppRoot` still uses the existing app-state and PWA hooks, but wraps them in `ClientRuntimeProvider`, which now creates and owns:

- command registry
- view registry
- action rail registry
- settings registry
- host settings store
- i18n service
- notification service
- diagnostics service
- active editor bridge
- extension-safe host adapter object

This provider split is the key Phase 6 architectural move.

## Implemented registries and services

### Command registry
Implemented under `src/features/commands/commandRegistry.ts`.

Responsibilities:
- register commands
- list registered commands
- execute commands by ID
- notify subscribers when command inventory changes

### View registry
Implemented under `src/features/views/viewRegistry.ts`.

Responsibilities:
- register views
- open/close/focus views
- track active/open view state
- preserve view inputs

### Action rail registry
Implemented under `src/features/action-rail/actionRailRegistry.ts`.

Responsibilities:
- register action rail entries
- sort entries by group and order
- manage per-item badges
- record reveal requests

### Settings registry
Implemented under `src/features/settings/settingsRegistry.ts`.

Responsibilities:
- register settings sections
- sort sections by panel and order
- allow schema-backed or custom-rendered sections

### I18n service
Implemented under `src/features/i18n/clientI18nService.ts`.

Responsibilities:
- register locale catalogs
- format manifest-style labels
- expose current locale

### Notification service
Implemented under `src/features/notifications/clientNotificationService.ts`.

Responsibilities:
- bridge host notifications to the existing toast system

### Diagnostics service
Implemented under `src/features/diagnostics/clientDiagnosticsService.ts`.

Responsibilities:
- collect diagnostics by extension ID or source ID
- expose publish/clear/list operations

### Active editor bridge
Implemented under `src/features/editor/activeEditorBridge.tsx`.

Responsibilities:
- track the active editor instance
- expose editor handle state to host adapters
- provide a stable bridge for editor read/write operations

## Shell surfaces now backed by registries

### Action rail
`components/Chassis/ActionRail/ActionRail.tsx` is now a generic renderer.

`src/shell/ActionRailHost.tsx` adapts registry entries into concrete shell buttons.

Result:
- the action rail is no longer a fully hardcoded surface
- future extensions can target the same shape used by core client features

### Command palette
`components/Modals/CommandPalette.tsx` is now a generic palette component.

`src/shell/CommandPaletteView.tsx` projects registered commands and current files into that generic component.

Result:
- the command palette is no longer a hardcoded action list only
- the same registry can later serve extension-contributed commands

### Settings
`components/Modals/SettingsModal.tsx` is now a generic section renderer.

`src/shell/SettingsView.tsx` obtains sections from the settings registry and uses `SettingsSchemaRenderer` when a section is schema-backed.

Result:
- settings are no longer a purely hardcoded modal body
- the host now has a path for schema-driven extension settings

### Views
`src/shell/ViewLayerHost.tsx` renders any open registered non-main views. Main work-mode routing is still partially bridged through the legacy `appMode` state for the Git pane.

Result:
- modal and overlay views are no longer limited to directly embedded root-level conditionals
- the client now has a general-purpose open/close/focus surface for future extensions
- main-area view composition is improved but not yet fully generalized

## Core client features now use host-ready surfaces

Phase 6 registers core client functionality through `useCoreSurfaceRegistrations.tsx`.

This includes:
- core commands
- core modal views and a bridged main Git view
- core action rail entries
- core settings sections
- core i18n labels

That is the critical Phase 6 exit condition: core client features now flow through the same registries that future extensions will use.

## Host-safe adapters

Implemented under `src/extensions/host/`.

The adapter layer exposes a typed `ExtensionHost` object backed by the client's new registries and services.

Implemented adapters:
- commands
- views
- action rail
- settings
- notifications
- i18n
- diagnostics
- theme
- editor
- workspace

## Rules established by this phase

### Rule 1
Future extensions must use the host adapter surface, not arbitrary imports from `apps/client/hooks`, `apps/client/components`, or `apps/client/services`.

### Rule 2
Core client features should prefer registry registration over adding new hardcoded shell branches.

### Rule 3
Schema-driven settings are now a first-class host surface, even where core sections still use custom renderers.

### Rule 4
The editor bridge is the supported path for host-mediated editor access until the standalone runtime package exists.

## What remains for later phases

Phase 6 is intentionally incomplete relative to the final extension platform.

Still missing:
- standalone `@markdown-workspace/extension-runtime` package
- packaged Extension Manager
- packaged Gemini Agent extension
- packaged Theme Studio extension
- runtime compatibility enforcement
- runtime extension installation/update flow
- full diagnostics UI
- package-matrix CI validation for the host/runtime split

## Phase 6 completion statement

Phase 6 completes the client-side host refactor required before building the extension runtime package:

- app shell split into app/shell/features areas
- registry-driven command palette, action rail, settings, and modal-view surfaces
- main Git view bridged through the new view registry while still using legacy `appMode` switching internally
- host-safe adapters added
- core client features registered through those surfaces

This is an **extension-ready host checkpoint**, not the final runtime implementation.
