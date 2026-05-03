# @mdwrk/mdwrkspace

[![Website](https://img.shields.io/badge/website-mdwrk.com-0f766e)](https://mdwrk.com)

`@mdwrk/mdwrkspace` is the MdWork client application package. It ships the offline-first Markdown workspace, the runtime-backed shell surfaces, the extension host adapters, the retained-version PWA client, and the shared responsive layout contract used by every client theme.

## Shell layout

The shell keeps one structural contract across themes. Themes restyle the surfaces, but they do not redefine the shell regions.

```text
+----------------------------------------------------------------------------------+
| Header                                                                           |
| Brand / project switcher | tabs | zoom / PWA action / system config             |
+--------------------+-------------------------------------------------------------+
| Action rail        | Workspace                                                   |
| Primary actions    | +---------------------+-----------------------------------+ |
| and registered     | | Panel / workspace   | View toolbar                      | |
| extension views    | | sidebar             +-----------------------------------+ |
|                    | |                     | Split stage panes / registered     | |
|                    | |                     | workspace surface                  | |
|                    | +---------------------+-----------------------------------+ |
+--------------------+-------------------------------------------------------------+
| Footer / status bar                                                              |
| Storage, cursor, encoding, autosave, save state, network, runtime, updates      |
+----------------------------------------------------------------------------------+
```

The live shell is composed in `src/shell/AppShell.tsx` from:

- `Header`
- `ActionRailHost`
- `WorkPane`
- `Footer`
- modal and overlay hosts such as `ViewLayerHost`, `InputModal`, the update banner, and toasts

## Header layout

The header is a three-zone chassis on standard widths and a two-row chassis on narrower widths.

### Header zones

- Left zone: project switch surface. The brand area shows the current theme icon and project title, and clicking it opens project switching.
- Center zone: tab strip. Open files render as draggable tabs with close affordances. The active work tab expands when the shell is in work mode.
- Right zone: shell controls. This region contains zoom controls, an optional PWA action button, and the system configuration button.

### Header behavior

- Standard layout: `grid-template-columns: minmax(180px, 0.9fr) minmax(0, 1.6fr) auto`
- Tabs scroll horizontally when the open set exceeds available width.
- Tab labels are clipped with ellipsis instead of growing the header indefinitely.
- At `max-width: 900px`, the header becomes a two-row arrangement:
  - row 1: brand at left, controls at right
  - row 2: tabs spanning the full width
- At compact phone sizes, control spacing, zoom display width, and button size are reduced to keep the header usable without collapsing shell features.

## Action rail

The action rail is the primary command strip for workspace and extension surfaces.

### Rail responsibilities

- Hosts the explorer toggle command for the default file workspace
- Hosts registered extension actions and view toggles
- Reflects active state for the open or focused view
- Respects workspace preferences that hide individual rail buttons
- Supports two display modes:
  - `icon-only`
  - `labeled`

### Rail behavior

- Default shell layout: vertical rail on the left edge
- Narrow portrait layout: horizontal rail below the workspace and above the footer
- Narrow compact landscape layout: vertical rail returns to the left edge to preserve workspace height
- If a registered view owns the main workspace, activating its rail item can also reopen the sidebar when that view provides a sidebar surface

## Workspace

The workspace is the main content region. It is described in shell terms so the README stays accurate whether the active surface is the Markdown editor, Git operations, Theme Studio, Language Pack Studio, or another registered workspace view.

### Workspace regions

- `Panel / workspace sidebar`: the sidebar region on the left in standard layouts, or above the stage in narrow portrait layouts
- `View toolbar`: the workspace-local command strip above or below the stage, depending on the responsive layout
- `Split stage panes / registered workspace surface`: the main content region that can show one pane, two panes, or a registered workspace surface

### Explorer panel

The explorer is a panel, not a special workspace mode.

- Default content: file tree and file actions
- Replacement behavior: registered workspace views can provide a custom sidebar surface, and that sidebar replaces the default file tree while the shell layout remains the same
- Width contract on larger layouts:
  - minimum width: `220px`
  - maximum width: `min(40vw, 420px)`
- Resize behavior:
  - the user can drag the sidebar edge
  - runtime resize limits in `WorkPane.tsx` keep the panel between `180px` and `480px`
- Panel header actions in the default file workspace:
  - expand all
  - collapse all
  - new file
  - new folder
  - rename
  - delete

### Split stage panes

The split stage describes panes, not a workspace-specific product view.

- `editor` mode: source editor pane only
- `preview` mode: renderer pane only
- `split` mode: source editor pane plus renderer pane
- On standard widths, the split uses a vertical separator and left-right panes
- On smaller widths, the split stacks into top-bottom panes and the separator becomes a horizontal resize handle
- Split mode is gated by `isSplitViewAllowedForViewport(...)`; when the viewport falls outside the allowed policy, the shell drops back to single-pane editor mode

### View toolbar

The view toolbar is the stage-local control strip. Its content is preference-aware, but its placement is layout-driven by the responsive shell contract.

#### Toolbar responsibilities

- switches between `editor`, `split`, and `preview`
- exposes formatting and editing commands such as:
  - bold
  - italic
  - strikethrough
  - bullet list
  - task list
  - indent / outdent
  - insert table
  - inline math
  - footnote
  - superscript / subscript
  - undo / redo

#### Toolbar location variants

The current shell exposes two toolbar placements:

- Stage-top toolbar:
  - standard desktop and laptop layouts
  - narrow but non-portrait layouts where the rail remains vertical
  - the toolbar sits above the pane body and spans the full stage width
- Stage-bottom toolbar:
  - narrow portrait layouts
  - the toolbar moves below the pane body, gains bottom safe-area padding, and keeps horizontal scrolling for overflow

This placement is currently determined by the responsive CSS contract rather than by a user-selectable toolbar-position preference.

## Footer

The footer is a persistent status bar that reports runtime and document state.

### Footer left group

- IndexedDB persistence state
- cursor location as `LN` and `COL`
- encoding state, currently `UTF-8`

### Footer right group

- auto-save status
- document save state: `SAVED` or `UNWRITTEN`
- network state: `ONLINE` or `OFFLINE`
- runtime label: `PWA` or `BROWSER` plus version and build id
- retained-version or update indicators:
  - `NEWER_VERSION_AVAILABLE`
  - `UPDATE_READY`

On narrow portrait layouts, the footer stays horizontally scrollable rather than wrapping status content into a taller multi-row block.

## Workspace variations

The shell supports several workspace presentations without changing the underlying layout vocabulary.

### Panel toggled open

```text
+--------------------+--------------------------------------------------+
| Explorer panel     | Stage                                            |
| file tree or       | editor / split / preview / registered view       |
| workspace sidebar  |                                                  |
+--------------------+--------------------------------------------------+
```

- Standard layout: explorer sits beside the stage
- Narrow portrait layout: explorer sits above the stage

### Panel toggled closed

```text
+-----------------------------------------------------------------------+
| Stage                                                                 |
| editor / split / preview / registered view                            |
+-----------------------------------------------------------------------+
```

- The explorer collapses to zero width on side-by-side layouts
- The explorer collapses to zero height on narrow portrait layouts
- Rail commands remain available so the panel can be reopened

### Single-pane stage

```text
+-----------------------------------------------------------------------+
| Pane                                                                  |
| source editor or preview surface                                      |
+-----------------------------------------------------------------------+
```

- `editor` mode uses one source pane
- `preview` mode uses one preview pane
- registered main views can also occupy the full stage as a single pane

### Split stage

```text
+-----------------------------------+-----------------------------------+
| Left pane                         | Right pane                        |
| source editor                     | preview renderer                  |
+-----------------------------------+-----------------------------------+
```

- Standard layout: left-right split with draggable divider
- Smaller layouts: top-bottom split with draggable divider
- Runtime split position is quantized in 5% bands and constrained to the 20% to 80% range

### View-toolbar placement variants

```text
Desktop / standard
+-----------------------------------------------------------------------+
| View toolbar                                                          |
+-----------------------------------------------------------------------+
| Stage panes                                                           |
+-----------------------------------------------------------------------+

Portrait / narrow
+-----------------------------------------------------------------------+
| Stage panes                                                           |
+-----------------------------------------------------------------------+
| View toolbar                                                          |
+-----------------------------------------------------------------------+
```

## Aspect-ratio layout variants

The canonical viewport contract lives in `apps/client/styles/base/viewports.css`. Themes may style each band differently, but they must not redefine the breakpoint bands or the shell behavior implied by them.

### `portrait`

- Contract: `max-aspect-ratio: 3/4`
- On narrow portrait screens, the shell becomes a single-column stack:
  - header
  - workspace
  - action rail
  - footer
- The explorer panel stacks above the stage when open
- The toolbar moves below the stage content
- This is the most touch-forward workspace presentation

### `square-hybrid`

- Contract: `min-aspect-ratio: 3/4` and `max-aspect-ratio: 4/3`
- The shell generally preserves the side rail and side-by-side workspace structure when width allows it
- At narrower widths, the header still folds into the two-row brand-controls-plus-tabs arrangement
- Split mode may stack vertically once the width breakpoint requires it even though the overall aspect ratio is more balanced than portrait

### `landscape`

- Contract: `min-aspect-ratio: 4/3` and `max-aspect-ratio: 16/9`
- This is the baseline desktop and laptop composition:
  - vertical rail at left
  - header across the top
  - explorer beside stage
  - footer at bottom
- On compact widths within this aspect band, the rail remains vertical so the workspace keeps as much height as possible

### `wide`

- Contract: `min-aspect-ratio: 16/9` and `max-aspect-ratio: 21/9`
- The shell keeps the standard left-rail layout and benefits from wider tab capacity and more comfortable split panes
- The explorer and stage have more simultaneous usable width, which is the most natural presentation for open panel plus split stage

### `ultra-wide`

- Contract: `min-aspect-ratio: 21/9`
- The shell still uses the same structural contract; it does not add extra regions
- The gain is spatial, not architectural:
  - longer tab runway
  - more generous stage panes
  - more comfortable coexistence of explorer, split panes, and toolbar controls

## Width tiers

- `xs`: `max-width: 479px`
- `sm`: `min-width: 480px` and `max-width: 599px`
- `md`: `min-width: 600px` and `max-width: 767px`
- `lg`: `min-width: 768px` and `max-width: 1023px`
- `xl`: `min-width: 1024px` and `max-width: 1439px`
- `xxl`: `min-width: 1440px`

## Height tiers

- `short`: `max-height: 599px`
- `compact`: `min-height: 600px` and `max-height: 719px`
- `tall`: `min-height: 720px` and `max-height: 1079px`
- `ultra-tall`: `min-height: 1080px`

## Device classes

- `touch`: `(hover: none) and (pointer: coarse)`
- `precision`: `(hover: hover) and (pointer: fine)`

## Component system architecture

### Shell and runtime

- `src/app/AppRoot.tsx` boots the app controller, PWA controller, runtime provider, extension runtime provider, and host keyboard shortcuts
- `src/app/runtime/ClientRuntimeContext.tsx` exposes runtime snapshot, services, and extension host through React context
- `src/app/runtime/useCoreSurfaceRegistrations.tsx` registers core commands, settings sections, modal views, and rail actions
- `src/shell/AppShell.tsx` assembles the live client shell
- `src/shell/ViewLayerHost.tsx` renders modal-capable registered views such as system configuration and command surfaces

### Chassis and work surfaces

- `components/Chassis/Header/Header.tsx` owns project switching, tab presentation, zoom, and settings entry
- `components/Chassis/WorkPane/WorkPane.tsx` owns the explorer panel, panel resizing, stage mounting, and idle state
- `components/Chassis/WorkPane/Stage/EditorPane.tsx` owns pane mode switching, split resizing, and the table builder modal
- `components/Markdown/WorkspaceMarkdownEditor.tsx` and `components/Markdown/WorkspaceMarkdownRenderer.tsx` bind the editor and renderer packages into the workspace shell
- `components/Chassis/Footer/Footer.tsx` owns the runtime and document status bar

### Extension system architecture

- `src/extensions/host/createClientExtensionHost.ts` builds the client extension host bridge
- `src/extensions/host/adapters/*` maps extension capabilities onto shell services such as action rail, commands, diagnostics, editor, i18n, notifications, settings, themes, views, and workspace APIs
- `src/extensions/runtime/ExtensionRuntimeProvider.tsx` mounts runtime state, bundled registrations, trust policy, smoke gates, and diagnostics
- `src/extensions/runtime/createClientExtensionRegistrationSink.tsx` converts runtime registrations into client-visible shell surfaces
- `packages/extensions/extension-runtime` is the portable extension engine for manifests, activation, installation, compatibility checks, and persisted runtime state

## Hooks

### Runtime and shell hooks

- `useClientRuntimeSnapshot()`
- `useClientRuntimeServices()`
- `useClientExtensionHost()`
- `useHostKeyboardShortcuts()`

### Feature hooks

- `useClientI18n()`
- `useWorkspacePreferences()`
- `useActiveEditorBridge()`
- `useMarkdownProfileConfig()`
- `useStoredLanguagePacks()`
- `useApp()`
- `usePwa()`

## Available extensions

The client currently ships with these extension surfaces:

- `@mdwrk/extension-runtime`
- `@mdwrk/extension-workspace-files`
- `@mdwrk/extension-git-ops`
- `@mdwrk/extension-manager`
- `@mdwrk/extension-gemini-agent`
- `@mdwrk/extension-theme-studio`
- `@mdwrk/extension-language-pack-studio`
- `@mdwrk/extension-catalog-hello`

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

## Validation

Useful local commands:

```bash
npm run build -w apps/client
npm run test:run -w apps/client
npm run screenshots:matrix -w apps/client
```
