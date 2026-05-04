# Editor packages

## Scope

The portable editor family provides reusable source-mode editing primitives and a React editing surface that can be consumed by the main client or by third-party applications.

Implemented packages:
- `mdwrk/markdown-editor-core`
- `mdwrk/markdown-editor-react`
- `mdwrk/markdown-edit-in-renderer-react`

## Package split

### `mdwrk/markdown-editor-core`
Owns:
- document snapshot types
- selection and cursor contracts
- selection transforms
- markdown formatting commands
- indent/outdent helpers
- history state and undo/redo transitions
- host-facing editor API contracts
- stable editor semantic class names

### `mdwrk/markdown-editor-react`
Owns:
- `MarkdownSourceEditor`
- controlled/uncontrolled value handling
- textarea selection synchronization
- keyboard shortcut wiring
- command execution bridge to the core package
- history notifications for consuming hosts
- theme variable bridge
- optional default stylesheet

### `mdwrk/markdown-edit-in-renderer-react`
Owns:
- `MarkdownEditInRenderer`
- Typora-style block activation inside the rendered document flow
- markdown block splitting and block replacement helpers
- composition over `mdwrk/markdown-renderer-react` for inactive blocks
- composition over `mdwrk/markdown-editor-react` for the active source block
- whole-document `onChange` emissions for host persistence
- theme variable bridge
- optional default stylesheet

## Host-consumption model

Applications should depend on the React source editor package for source-mode editing, or the edit-in-renderer package when they need a Typora-style rendered authoring flow. They may consume core exports either directly or through the React package re-export surface.

The main client now consumes editing through the editor package boundary rather than through client-local textarea logic.

## Styling and theming

The React package exports a theme bridge through `createMarkdownEditorThemeStyle()` and an optional stylesheet:

```css
@import url("@mdwrk/markdown-editor-react/styles/default.css");
```

The edit-in-renderer package adds its own bridge and stylesheet:

```css
@import url("@mdwrk/markdown-renderer-react/styles/default.css");
@import url("@mdwrk/markdown-editor-react/styles/default.css");
@import url("@mdwrk/markdown-edit-in-renderer-react/styles/default.css");
```

The editor family uses stable semantic class names and CSS custom properties so that:
- the workspace client can map the package onto its own theme variables
- third-party consumers can style the package without importing app-local stylesheets

## Current limitations

The edit-in-renderer package provides rendered-block activation, not a full rich-text AST editor. Extension-aware rich editing remains outside this package boundary.


## Phase 3 checkpoint note

The current checkpoint adds a task-list command in the core editor command set and example/client wiring that aligns the source editor with the default GFM profile.
This is useful authoring progress, but it is not yet the full later-phase editor/UIX parity closure.
