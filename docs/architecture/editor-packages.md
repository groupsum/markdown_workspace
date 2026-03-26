# Editor packages

## Scope

The portable editor family provides reusable source-mode editing primitives and a React editing surface that can be consumed by the main client or by third-party applications.

Implemented packages:
- `mdwrk/markdown-editor-core`
- `mdwrk/markdown-editor-react`

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

## Host-consumption model

Applications should depend on the React package for the surface component and may consume core exports either directly or through the React package re-export surface.

The main client now consumes editing through the editor package boundary rather than through client-local textarea logic.

## Styling and theming

The React package exports a theme bridge through `createMarkdownEditorThemeStyle()` and an optional stylesheet:

```css
@import url("@mdwrk/markdown-editor-react/styles/default.css");
```

The editor family uses stable semantic class names and CSS custom properties so that:
- the workspace client can map the package onto its own theme variables
- third-party consumers can style the package without importing app-local stylesheets

## Current limitations

This phase implements a source-mode editor only. It does not introduce a rich WYSIWYG editor or extension-aware editing surfaces yet.
