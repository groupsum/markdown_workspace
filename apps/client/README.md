# @mdwrk/mdwrkspace

`@mdwrk/mdwrkspace` is the MdWork client application package. It ships the offline-first Markdown workspace, the runtime-backed shell surfaces, the extension host adapters, the retained-version PWA client, and the shared responsive layout contract used by every client theme.

## Layout model

The shell layout stays structurally consistent across themes even when each theme restyles the surfaces:

```text
+----------------------------------------------------------------------------------+
| Header                                                                           |
| Tabs, project switcher, zoom, settings, retained-version PWA actions             |
+--------------------+-------------------------------------------------------------+
| Action rail        | Work pane                                                   |
| Commands, modes,   | +---------------------------+-----------------------------+ |
| project/system     | | Explorer panel            | Split stage                 | |
| shortcuts          | | File tree or workspace    | Editor pane and preview     | |
|                    | | browser surface           | pane, with resizable split  | |
|                    | +---------------------------+-----------------------------+ |
+--------------------+-------------------------------------------------------------+
| Footer / status bar                                                              |
| Cursor telemetry, dirty state, connectivity, installed/update state, build info  |
+----------------------------------------------------------------------------------+
```

- The `Explorer` is a panel. It hosts the file tree by default and can be replaced by workspace-browser surfaces registered by core features or extensions.
- The `split stage` describes panes, not a workspace-specific mode. In the default editor surface it is the editor pane plus preview pane; in extension panes it becomes the extension's primary content panes.
- Workspace views are rendered into the work pane through the view registry, so layout language stays stable whether the active surface is the editor, Git operations, Theme Studio, Language Pack Studio, or the extension manager.

## Component system architecture

### Shell and runtime

- `src/app/AppRoot.tsx` boots the app controller, PWA controller, runtime provider, extension runtime provider, and host keyboard shortcuts.
- `src/app/runtime/ClientRuntimeContext.tsx` exposes the runtime snapshot, services, and extension host through React context.
- `src/app/runtime/useCoreSurfaceRegistrations.tsx` registers core commands, settings sections, modal views, and rail actions.
- `src/shell/AppShell.tsx` composes the chassis, project selector, header, action rail, work pane, footer, modal layer, and toast layer.
- `src/shell/ViewLayerHost.tsx` renders modal-capable registered views such as system configuration and the command palette.

### Chassis and work surfaces

- `components/Chassis/Header/Header.tsx` owns tabs, project switching, zoom, and settings entry.
- `components/Chassis/WorkPane/WorkPane.tsx` owns the explorer panel, panel resizing, stage mounting, and idle state.
- `components/Chassis/WorkPane/Stage/EditorPane.tsx` owns editor-only, split, and preview-only pane modes plus the stage splitter and table-builder modal.
- `components/Markdown/WorkspaceMarkdownEditor.tsx` and `components/Markdown/WorkspaceMarkdownRenderer.tsx` bind the portable editor and renderer packages into the shell.
- `components/Chassis/Git/GitPane.tsx` mounts source-control surfaces as work-pane content rather than as an inner sidebar clone.

### Extension system architecture

- `src/extensions/host/createClientExtensionHost.ts` builds the host bridge used by bundled and installed extensions.
- `src/extensions/host/adapters/*` maps extension capabilities onto shell services: action rail, commands, diagnostics, editor, i18n, notifications, settings, theme, views, and workspace APIs.
- `src/extensions/runtime/ExtensionRuntimeProvider.tsx` mounts the runtime, bundled registrations, trust policy, smoke gates, and diagnostics.
- `src/extensions/runtime/createClientExtensionRegistrationSink.tsx` converts runtime registrations into client-visible shell surfaces.
- `packages/extensions/extension-runtime` is the portable extension engine for manifests, activation, install/update/remove, compatibility checks, and persisted runtime state.

## Hooks

The client uses a small shell-facing hook layer instead of wiring component state ad hoc.

### Runtime and shell hooks

- `useClientRuntimeSnapshot()` reads the app and PWA runtime snapshot.
- `useClientRuntimeServices()` reads service registries for views, commands, settings, action rail, diagnostics, and i18n.
- `useClientExtensionHost()` exposes the extension host adapter surface.
- `useHostKeyboardShortcuts()` binds registered commands to the host keyboard surface.

### Feature hooks

- `useClientI18n()` exposes translated labels, active locale, and locale mutation.
- `useWorkspacePreferences()` reads persisted workspace layout, toolbar, and export preferences.
- `useActiveEditorBridge()` lets commands and extensions target the active editor safely.
- `useMarkdownProfileConfig()` controls Markdown capability profiles and HTML trust policy.
- `useStoredLanguagePacks()` exposes built-in and installed language packs from device-local persistence.
- `useApp()` and `usePwa()` provide the app controller and retained-version PWA state used during shell bootstrap.

## Available extensions

The client currently ships with these extension surfaces:

- `@mdwrk/extension-runtime`: runtime engine for bundled and installed extensions.
- `@mdwrk/extension-workspace-files`: workspace file actions and file-surface integration.
- `@mdwrk/extension-git-ops`: source-control workspace surfaces and commands.
- `@mdwrk/extension-manager`: runtime inventory, compatibility, enablement, and settings surface.
- `@mdwrk/extension-gemini-agent`: AI workflow pane and settings surface.
- `@mdwrk/extension-theme-studio`: theme authoring, token inspection, preview, and export surface.
- `@mdwrk/extension-language-pack-studio`: language-pack authoring, import/export, and activation surface.
- `@mdwrk/extension-catalog-hello`: sample external installable extension used to exercise the catalog path.

## Themes

Themes share one breakpoint contract and one shell structure while each theme provides its own visual system. The current catalog includes:

- `tensioned-technical-skeleton`
- `optical-vellum-drafting-grid`
- `heavy-gauge-tectonic`
- `ferrous-monolith`
- `galvanized-cellular`
- `pressed-chromium`
- `acid-etched`
- `zinc`
- `anodized-billet`
- `micropress`
- `research-science`
- `pneumatic-mycelial-scaffolding`
- `lander-light`
- `lander-dark`
- `default`

## Viewbox contract

The canonical viewport contract lives in `apps/client/styles/base/viewports.css`. Themes may style each band differently, but they must not redefine the breakpoint bands.

### Aspect ratio bands

- `portrait`: `max-aspect-ratio: 3/4`
- `square-hybrid`: `min-aspect-ratio: 3/4` and `max-aspect-ratio: 4/3`
- `landscape`: `min-aspect-ratio: 4/3` and `max-aspect-ratio: 16/9`
- `wide`: `min-aspect-ratio: 16/9` and `max-aspect-ratio: 21/9`
- `ultra-wide`: `min-aspect-ratio: 21/9`

### Width tiers

- `xs`: `max-width: 479px`
- `sm`: `min-width: 480px` and `max-width: 599px`
- `md`: `min-width: 600px` and `max-width: 767px`
- `lg`: `min-width: 768px` and `max-width: 1023px`
- `xl`: `min-width: 1024px` and `max-width: 1439px`
- `xxl`: `min-width: 1440px`

### Height tiers

- `short`: `max-height: 599px`
- `compact`: `min-height: 600px` and `max-height: 719px`
- `tall`: `min-height: 720px` and `max-height: 1079px`
- `ultra-tall`: `min-height: 1080px`

### Device classes

- `touch`: `(hover: none) and (pointer: coarse)`
- `precision`: `(hover: hover) and (pointer: fine)`

## Validation

Useful local commands:

```bash
npm run build -w apps/client
npm run test:run -w apps/client
npm run screenshots:matrix -w apps/client
```
