# Renderer packages

This package family contains the portable Markdown rendering stack for Markdown Workspace.

## Packages

- `mdwrk/markdown-renderer-core`
  - markdown parsing
  - frontmatter parsing
  - heading extraction
  - semantic HTML rendering
  - HTML document serialization
- `mdwrk/markdown-renderer-react`
  - React `<MarkdownRenderer />`
  - static server rendering helpers
  - default semantic component mapping
  - optional default stylesheet
  - renderer theme bridge

Both packages are designed to be consumed by `apps/client`, `apps/lander`, future extension packages, and third-party host applications.
