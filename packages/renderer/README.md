# Renderer packages

[![Hits](https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.packages.renderer.readme&left_text=hits)](https://github.com/groupsum/markdown_workspace/blob/master/packages/renderer/README.md)
[![Downloads](https://img.shields.io/github/downloads/groupsum/markdown_workspace/total?label=downloads)](https://github.com/groupsum/markdown_workspace/releases)

This package family contains the portable Markdown rendering stack for MdWrk.

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

Both packages are designed to be consumed by `apps/client`, `apps/mdwrkcom`, first-party extension packages, and third-party host applications.
