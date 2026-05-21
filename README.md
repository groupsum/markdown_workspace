<div align="center">
# MdWrk
**Markdown workspace platform**
[![Hits](https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.README&left_text=hits)](https://github.com/groupsum/markdown_workspace/blob/master/README.md)
[![Downloads](https://img.shields.io/github/downloads/groupsum/markdown_workspace/total?label=downloads)](https://github.com/groupsum/markdown_workspace/releases)
[![Node](https://img.shields.io/badge/node-20.x%20%7C%2021.x%20%7C%2022.x-339933?logo=node.js&logoColor=white)](package.json)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
</div>

MdWrk is a multi-package workspace for markdown authoring, rendering, in-place editing, extension runtime delivery, lander publishing, and repository governance.

## Why
The repo is organized like the strongest public package READMEs: start with the product promise, show how to install and run it quickly, then make the package graph and docs easy to navigate. This README is the front door for the repo, not just a file inventory.

## What
- Application surfaces for the MdWrk client and desktop shell, plus a legacy bridge release line for extracted `@mdwrk/*` packages now maintained in `groupsum/mdwrk` and `groupsum/mdwrk-pages`.
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
npm run test
npm run conformance
```

Start from the package indexes below when you want one surface instead of the whole repo.

## Repo Transition
- Active maintenance for reusable renderer, editor, contract, extension, shared, and lander packages moved into the extracted repos `groupsum/mdwrk` and `groupsum/mdwrk-pages`.
- This repository now carries a legacy bridge release line for those packages so npm consumers can continue installing the same `@mdwrk/*` names during the migration window.
- `@mdwrk/mdwrkcom-content-pack` moved to its new source-of-truth home in `mdwrkcom`.
- GitHub workflow automation is being removed here as the repository winds down.



## How
- `apps/` contains retained local application history for the client and desktop surfaces.
- `packages/` contains the remaining local packages plus the legacy bridge packages that redirect maintenance to the extracted repos.
- `docs/` contains architecture, conformance, and release guidance.
- `tools/` contains the automation that keeps the repo reproducible and certifiable.
- `examples/` proves the package API shape from an external-consumer perspective.

## Related
- [Apps](./apps/client/README.md) - client app entrypoint
- [Desktop Shell](./apps/desktop/README.md) - Electron and Capacitor wrapper
- [Packages Index](./packages/README.md) - all reusable package families
- [Docs Index](./docs/README.md) - architecture, conformance, and operations
- [Examples](./examples/README.md) - public package consumption examples
- [Tooling](./tools/README.md) - CI, release, and governance scripts
- [npm org](https://www.npmjs.com/org/mdwrk) - published package scope
