<div align="center">
# MdWrk Editor
**Source-mode and in-renderer editing**
[![Hits](https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.packages_editor_README&left_text=hits)](https://github.com/groupsum/markdown_workspace/blob/master/packages/editor/README.md)
[![Downloads](https://img.shields.io/github/downloads/groupsum/markdown_workspace/total?label=downloads)](https://github.com/groupsum/markdown_workspace/releases)
[![Node](https://img.shields.io/badge/node-20.x%20%7C%2021.x%20%7C%2022.x-339933?logo=node.js&logoColor=white)](../../package.json)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](../../LICENSE)
</div>

The editor family provides headless markdown editing logic, a React source editor, and an in-renderer block editing surface.

## Why
The editing stack has three layers, and good README navigation should show where state, UI, and in-place editing responsibilities split.

## What
- `@mdwrk/markdown-editor-core` for commands, transforms, selections, and history.
- `@mdwrk/markdown-editor-react` for the textarea-based source editor component.
- `@mdwrk/markdown-edit-in-renderer-react` for block activation inside rendered markdown.

## Installation
Node.js 20.x through 22.x, matching the workspace engine contract in the root package manifest.

```bash
npm install @mdwrk/markdown-editor-core @mdwrk/markdown-editor-react @mdwrk/markdown-edit-in-renderer-react
```

## Usage
Pick the thinnest editing layer you need, then move up the stack only when the UX requires it.

- [markdown-editor-core](./markdown-editor-core/README.md)
- [markdown-editor-react](./markdown-editor-react/README.md)
- [markdown-edit-in-renderer-react](./markdown-edit-in-renderer-react/README.md)

## Related
- [Renderer family](../renderer/README.md) - rendering surfaces paired with these editors
- [Examples](../../examples/editor-basic/README.md) - standalone editor example
