<div align="center">
# @mdwrk/example-editor-basic
**Workspace example app**
[![Hits](https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.examples_editor_basic_README&left_text=hits)](https://github.com/groupsum/markdown_workspace/blob/master/examples/editor-basic/README.md)
[![Downloads](https://img.shields.io/github/downloads/groupsum/markdown_workspace/total?label=downloads)](https://github.com/groupsum/markdown_workspace/releases)
[![Node](https://img.shields.io/badge/node-20.x%20%7C%2021.x%20%7C%2022.x-339933?logo=node.js&logoColor=white)](../../package.json)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](../../LICENSE)
</div>

This example app demonstrates how to wire the public MdWrk editor and renderer packages together in a consumer-facing project shape.

## Why
It is the quickest way to confirm that source editing, previewing, and public package boundaries work outside the main client application.

## What
- A small app that consumes the editor and renderer packages through their published entrypoints.
- A reference for install, build, and local debugging flow.
- Proof that package consumers do not need private client internals to build a usable editing surface.

## Installation
Node.js 20.x through 22.x, matching the workspace engine contract in the root package manifest.

```bash
npm install
npm run build -w @mdwrk/example-editor-basic
```

## Usage
Build the example from the workspace root, then inspect how the public package interfaces are imported.

```bash
npm run typecheck -w @mdwrk/example-editor-basic
npm run build -w @mdwrk/example-editor-basic
```

## Related
- [Examples index](../README.md) - all examples
- [Editor family](../../packages/editor/README.md) - editing packages used here
- [Renderer family](../../packages/renderer/README.md) - preview surface used here
