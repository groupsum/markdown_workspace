# MdWrk Renderer

**Markdown parsing and React rendering**

<p align="center">
  <a href="https://github.com/groupsum/markdown_workspace/blob/master/packages/renderer/README.md"><img alt="Hits" src="https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.packages_renderer_README&amp;left_text=hits" /></a>
  <a href="https://github.com/groupsum/markdown_workspace/releases"><img alt="Downloads" src="https://img.shields.io/github/downloads/groupsum/markdown_workspace/total?label=downloads" /></a>
  <a href="../../package.json"><img alt="Node" src="https://img.shields.io/badge/node-20.x%20%7C%2021.x%20%7C%2022.x-339933?logo=node.js&amp;logoColor=white" /></a>
  <a href="../../LICENSE"><img alt="License: Apache-2.0" src="https://img.shields.io/badge/license-Apache--2.0-blue.svg" /></a>
</p>

The renderer family turns markdown into HTML and React-rendered output using the same core parsing surface across packages and apps.

## Why
Consumers often want a headless rendering core or a React wrapper. This family README makes the split explicit and cross-linked.

## What
- `@mdwrk/markdown-renderer-core` for parsing, profile handling, headings, and HTML document generation.
- `@mdwrk/markdown-renderer-react` for React rendering with theme styles and link interception.

## Installation
Node.js 20.x through 22.x, matching the workspace engine contract in the root package manifest.

```bash
npm install @mdwrk/markdown-renderer-core @mdwrk/markdown-renderer-react
```

## Usage
Start with the core package for server-side or non-React use. Move to the React package when you need a component surface.

- [markdown-renderer-core](./markdown-renderer-core/README.md)
- [markdown-renderer-react](./markdown-renderer-react/README.md)

## Related
- [Editor family](../editor/README.md) - editing surfaces built on the renderer
- [Examples](../../examples/renderer-basic/README.md) - standalone renderer example
