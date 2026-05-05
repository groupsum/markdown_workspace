# Renderer packages

## Phase 4 checkpoint

This document describes the implemented portable renderer family added in Phase 4.

## Implemented packages

### `mdwrk/markdown-renderer-core`

Responsibilities:
- frontmatter parsing
- heading extraction
- stable heading slug generation
- semantic markdown-to-HTML rendering
- HTML document serialization
- stable semantic renderer class-name contract

Primary exports:
- `parseMarkdownDocument`
- `extractMarkdownHeadings`
- `renderMarkdownToHtml`
- `createHtmlDocument`
- `renderMarkdownToHtmlDocument`

### `mdwrk/markdown-renderer-react`

Responsibilities:
- React `<MarkdownRenderer />`
- default semantic class mapping
- fenced-code rendering with syntax highlighting
- static server rendering helpers
- theme style bridge
- default optional stylesheet

Primary exports:
- `MarkdownRenderer`
- `createMarkdownRendererThemeStyle`
- `renderMarkdownToStaticHtml`
- `renderMarkdownToStaticHtmlDocument`
- `./styles/default.css`

## Consumption model

Applications and future extensions consume the renderer family as follows:

```text
apps/client ─┬─> @mdwrk/markdown-renderer-react
             └─> @mdwrk/markdown-renderer-core

apps/mdwrkcom ─┬─> @mdwrk/markdown-renderer-react
             └─> @mdwrk/markdown-renderer-core
```

The React package depends on the core package. Applications should not reimplement markdown rendering once they have adopted these packages.

## Styling model

The renderer family does not depend on application-local stylesheets.

Instead:
- semantic class names remain stable
- default stylesheet imports `mdwrk/ui-tokens/styles/markdown.css`
- host applications can apply a theme bridge using CSS variables or inline theme style records

## Interop goal

Third-party consumers should be able to:
- import the core package for parsing or HTML generation without React
- import the React package for UI rendering
- apply either Markdown Workspace theme tokens or their own theme variables

## Phase 2 checkpoint note

The current checkpoint advances the renderer family to a committed self-contained Phase 2 renderer baseline. The committed dist now provides a portable internal AST, policy-controlled raw HTML handling, source-position attribute support, and an executable renderer test lane in the provided zip.


## Phase 3 checkpoint note

The current checkpoint also adds an executable default-GFM lane on top of the Phase 2 renderer baseline.
The renderer family now explicitly supports the default profile features frozen in Phase 0: tables, task list items, strikethrough, and autolink literals.
