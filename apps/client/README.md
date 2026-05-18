# @mdwrk/mdwrkspace

MdWrk browser client package for markdown authoring, previewing, extension hosting, theme switching, responsive workspace layout, and retained-version PWA delivery.

<p align="center">
  <a href="https://github.com/groupsum/markdown_workspace/blob/master/apps/client/README.md"><img alt="Hits" src="https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.apps_client_README&amp;left_text=hits" /></a>
  <a href="https://www.npmjs.com/package/@mdwrk/mdwrkspace"><img alt="Downloads" src="https://img.shields.io/npm/dm/%40mdwrk%2Fmdwrkspace?label=downloads" /></a>
  <a href="../../package.json"><img alt="Node" src="https://img.shields.io/badge/node-20.x%20%7C%2021.x%20%7C%2022.x-339933?logo=node.js&amp;logoColor=white" /></a>
  <a href="../../LICENSE"><img alt="License: Apache-2.0" src="https://img.shields.io/badge/license-Apache--2.0-blue.svg" /></a>
</p>

`@mdwrk/mdwrkspace` packages the client surface that MdWrk uses in the browser and desktop shell. It includes the workspace chrome, editor and preview surfaces, bundled first-party extensions, responsive viewport contract, and the mount function used by embedders.

## Why
Use it when you need the MdWrk client itself rather than one of the lower-level editor, renderer, theme, or extension packages. The package gives consumers the runnable workspace shell while keeping deeper architecture details linked to the repo docs.

## What
- A workspace shell with header, action rail, explorer/sidebar, stage, and footer regions.
- Built-in authoring, preview, theme, language, extension, and Git-adjacent surfaces.
- A single viewport contract shared across all themes, with theme-specific styling layered on top.
- A package-level `mountMdWrkSpace` entrypoint for embedding the client surface.

## Installation
Node.js 20.x through 22.x, matching the workspace engine contract in the root package manifest.

```bash
npm install @mdwrk/mdwrkspace
```

## Usage
Use the published package when you want the client surface itself.

```ts
import { mountMdWrkSpace } from "@mdwrk/mdwrkspace";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Missing MdWrk root element.");
}

const unmount = mountMdWrkSpace(root);
```

Run it from the workspace while iterating on the repo.

```bash
npm install
npm run dev:client
npm run build -w apps/client
npm run screenshots:matrix -w apps/client
```

The canonical viewport contract lives in `client/public/css/base/viewports.css`, and themes are expected to preserve that structural contract while restyling the bands.

## How
- Run `npm run dev:client` for local client iteration.
- Run `npm run screenshots:matrix -w apps/client` when you need full theme and viewport coverage artifacts.
- Use the extension family packages to understand the bundled runtime and first-party panels.

## Related
- [Root README](../../README.md) - repo overview
- [Desktop shell](../desktop/README.md) - native wrapper for this client
- [Extensions family](../../packages/extensions/README.md) - runtime and bundled extensions
- [Theme contract](../../packages/contracts/theme-contract/README.md) - theme compatibility surface
- [Docs](../../docs/README.md) - deeper architecture and conformance
