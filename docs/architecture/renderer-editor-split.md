# Renderer/editor split

## Decision

The repository will maintain **two distinct reusable package families**:
- a portable markdown renderer family
- a portable markdown editor family

A combined renderer+editor package is rejected.

## Why the split is required

### Different adoption patterns
Many consumers need rendering without editing. Fewer consumers need editing.

### Different dependency surfaces
Rendering and editing evolve at different rates and carry different complexity.

### Cleaner compatibility management
Consumers can upgrade rendering independently from editing.

### Better extension interoperability
Extensions can target rendering and editing through separate contracts.

## Package plan

### Renderer packages
- `@markdown-workspace/markdown-renderer-core`
- `@markdown-workspace/markdown-renderer-react`

### Editor packages
- `@markdown-workspace/markdown-editor-core`
- `@markdown-workspace/markdown-editor-react`

## Renderer responsibilities

The renderer family owns:
- markdown parsing/rendering pipeline
- heading extraction
- HTML serialization support
- React component bindings
- semantic class name contract
- CSS custom property bridge points

## Editor responsibilities

The editor family owns:
- source-mode editing behavior
- selection transforms
- editing commands
- history/undo-redo interfaces
- React editor bindings
- editor theming bridge points

## Current repository drivers for this decision

The current repo already shows renderer duplication:
- client preview rendering
- client HTML export rendering
- lander markdown viewer rendering

That duplication should be eliminated by the renderer package family.

The current editing behavior is embedded in the client. That behavior should be extracted behind an editor package boundary.

## Styling contract

Packages must not depend on app-local CSS files directly.

Instead:
- packages expose semantic class names
- packages consume shared CSS custom properties
- applications map their own theme tokens onto those properties

## Migration strategy

### Step 1
Extract the renderer first and migrate both `client` and `lander` onto it.

### Step 2
Extract the editor while preserving the current source-mode workflow.

### Step 3
Expose editor and renderer capabilities to extensions through host contracts where appropriate.
