# MdWrk

**Markdown workspace platform**

<p align="center">
  <a href="https://github.com/groupsum/markdown_workspace/blob/master/README.md"><img alt="Hits" src="https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.README&amp;left_text=hits" /></a>
  <a href="https://github.com/groupsum/markdown_workspace/releases"><img alt="Downloads" src="https://img.shields.io/github/downloads/groupsum/markdown_workspace/total?label=downloads" /></a>
  <a href="package.json"><img alt="Node" src="https://img.shields.io/badge/node-20.x%20%7C%2021.x%20%7C%2022.x-339933?logo=node.js&amp;logoColor=white" /></a>
  <a href="LICENSE"><img alt="License: Apache-2.0" src="https://img.shields.io/badge/license-Apache--2.0-blue.svg" /></a>
</p>

MdWrk is a multi-package workspace for markdown authoring, rendering, in-place editing, extension runtime delivery, lander publishing, and repository governance.

## Why
The repo is organized like the strongest public package READMEs: start with the product promise, show how to install and run it quickly, then make the package graph and docs easy to navigate. This README is the front door for the repo, not just a file inventory.

## What
- Application surfaces for the MdWrk client, desktop shell, and public marketing site.
- Reusable renderer, editor, shared, contract, extension, lander, and content packages under the `@mdwrk` scope.
- Governed documentation, SSOT specs, conformance scripts, release tooling, and generated evidence lanes.
- Example apps that validate public package consumption outside the first-party apps.

## Installation
Node.js 20.x through 22.x, matching the workspace engine contract in the root package manifest.

```bash
npm install
npm run build
```

## Usage
Use the workspace root when you want the full platform:

```bash
npm run dev:client
npm run dev:mdwrkcom
npm run test
npm run conformance
```

Start from the package indexes below when you want one surface instead of the whole repo.

## How
- `apps/` contains deployable surfaces.
- `packages/` contains reusable libraries grouped by family.
- `docs/` contains architecture, conformance, and release guidance.
- `tools/` contains the automation that keeps the repo reproducible and certifiable.
- `examples/` proves the package API shape from an external-consumer perspective.

## Related
- [Apps](./apps/client/README.md) - client app entrypoint
- [Desktop Shell](./apps/desktop/README.md) - Electron and Capacitor wrapper
- [Public Site](./apps/mdwrkcom/README.md) - mdwrk.com app
- [Packages Index](./packages/README.md) - all reusable package families
- [Docs Index](./docs/README.md) - architecture, conformance, and operations
- [Examples](./examples/README.md) - public package consumption examples
- [Tooling](./tools/README.md) - CI, release, and governance scripts
- [npm org](https://www.npmjs.com/org/mdwrk) - published package scope
