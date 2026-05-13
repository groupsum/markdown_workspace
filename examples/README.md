<div align="center">
# MdWrk Examples
**Standalone package-consumption examples**
[![Hits](https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.examples_README&left_text=hits)](https://github.com/groupsum/markdown_workspace/blob/master/examples/README.md)
[![Downloads](https://img.shields.io/github/downloads/groupsum/markdown_workspace/total?label=downloads)](https://github.com/groupsum/markdown_workspace/releases)
[![Node](https://img.shields.io/badge/node-20.x%20%7C%2021.x%20%7C%2022.x-339933?logo=node.js&logoColor=white)](../package.json)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](../LICENSE)
</div>

The examples tree contains small applications that consume MdWrk packages through their public package interfaces rather than private workspace internals.

## Why
Good package ecosystems prove that the published API shape works outside the first-party app. These examples do that validation work.

## What
- `editor-basic/` for source editing plus renderer integration.
- `renderer-basic/` for renderer-only consumption.
- A boundary check that reinforces package API usage instead of internal imports.

## Installation
Node.js 20.x through 22.x, matching the workspace engine contract in the root package manifest.

```bash
npm install
```

## Usage
```bash
npm run build -w @mdwrk/example-renderer-basic
npm run build -w @mdwrk/example-editor-basic
```

## Related
- [Renderer example](./renderer-basic/README.md) - renderer package usage
- [Editor example](./editor-basic/README.md) - editor package usage
- [Packages index](../packages/README.md) - published package families
