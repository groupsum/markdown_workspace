# @mdwrk/example-renderer-basic

**Workspace example app**

<p align="center">
  <a href="https://github.com/groupsum/markdown_workspace/blob/master/examples/renderer-basic/README.md"><img alt="Hits" src="https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.examples_renderer_basic_README&amp;left_text=hits" /></a>
  <a href="https://github.com/groupsum/markdown_workspace/releases"><img alt="Downloads" src="https://img.shields.io/github/downloads/groupsum/markdown_workspace/total?label=downloads" /></a>
  <a href="../../package.json"><img alt="Node" src="https://img.shields.io/badge/node-20.x%20%7C%2021.x%20%7C%2022.x-339933?logo=node.js&amp;logoColor=white" /></a>
  <a href="../../LICENSE"><img alt="License: Apache-2.0" src="https://img.shields.io/badge/license-Apache--2.0-blue.svg" /></a>
</p>

This example app demonstrates direct consumption of the public MdWrk renderer packages without the larger client application shell.

## Why
It keeps the rendering story easy to verify for downstream consumers who only need markdown output, not the full editor or extension host.

## What
- A standalone example focused on public renderer package APIs.
- A small reference target for integration smoke and pack validation.
- A minimal way to inspect renderer output and package wiring.

## Installation
Node.js 20.x through 22.x, matching the workspace engine contract in the root package manifest.

```bash
npm install
npm run build -w @mdwrk/example-renderer-basic
```

## Usage
```bash
npm run typecheck -w @mdwrk/example-renderer-basic
npm run build -w @mdwrk/example-renderer-basic
```

## Related
- [Examples index](../README.md) - all examples
- [Renderer family](../../packages/renderer/README.md) - rendering packages used here
