<div align="center">

# MdWrk

[![CI](https://img.shields.io/github/actions/workflow/status/groupsum/markdown_workspace/ci.yml?branch=master&label=CI)](./.github/workflows/ci.yml)
[![Conformance](https://img.shields.io/github/actions/workflow/status/groupsum/markdown_workspace/conformance.yml?branch=master&label=Conformance)](./.github/workflows/conformance.yml)
[![Website](https://img.shields.io/badge/website-mdwrk.com-0f766e)](https://mdwrk.com)
[![Node](https://img.shields.io/badge/node-20.x-339933?logo=node.js&logoColor=white)](./package.json)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](./LICENSE)
[![Repo Specs](https://img.shields.io/badge/specs-ssot%20governed-6f42c1)](./.ssot/specs/SPEC-2001-specs-index.yaml)

</div>

MdWrk is a multi-package workspace for the client, native application shells, lander, reusable markdown packages, extension contracts, first-party extension packages, third-party extension distribution tooling, and repository operations.

Retained client-version delivery and PWA version-state behavior are documented in [`docs/client-version-delivery.md`](./docs/client-version-delivery.md).

Canonical project URLs:

- GitHub repository: `https://github.com/groupsum/markdown_workspace`
- Package registry: `https://www.npmjs.com/org/mdwrk`

## Table of Contents
- [Repository Overview](#repository-overview)
- [Repository Structure](#repository-structure)
- [CI and Governance Conformance](#ci-and-governance-conformance)
- [Documentation Pointers](#documentation-pointers)
- [Community and Governance Files](#community-and-governance-files)
- [License](#license)

## Repository Overview
This repository contains application shells, package workspaces, extension runtime and extension distribution tooling, conformance gates, and release automation.

The native shell layer deploys the client bundle as:

- Electron on Windows, macOS, and Linux
- Capacitor on Android

## Repository Structure
- `apps/` — deployable applications (`client`, `lander`)
- `packages/` — contracts, renderer, editor, shared, and extension packages
- `examples/` — runnable examples for editor/renderer integration
- `docs/` — architecture, ADRs, conformance, current-state, and operations documentation
- `.ssot/specs/` — canonical repository specifications maintained through the SSOT registry
- `tools/` — CI, conformance, release, governance, and extension tooling
- `artifacts/` — generated evidence and release artifacts

## CI and Governance Conformance
Governance checks are enforced by CI and local scripts:
- tree validation
- doc-pointer validation
- root-clutter validation
- generated-artifact protection validation
- claim-language lint
- WIP-notes validation
- release-note validation

Run locally:

```bash
npm run ci:governance
```

## Documentation Pointers
- Workspace docs index: `docs/README.md`
- Desktop shell reference: `docs/apps/desktop-shell-app.md`
- Repository specs index: `.ssot/specs/SPEC-2001-specs-index.yaml`
- Repository governance spec: `.ssot/specs/SPEC-2002-repository-governance.yaml`
- Agents guidance: `AGENTS.md`
- Contribution guide: `CONTRIBUTING.md`
- Code of conduct: `CODE_OF_CONDUCT.md`
- License text: `LICENSE`

## Community and Governance Files
- `AGENTS.md` defines repository-specific operating constraints for automation agents.
- `CONTRIBUTING.md` documents contributor workflow and required checks.
- `CODE_OF_CONDUCT.md` defines behavior standards for participation.

## License
Licensed under the Apache License, Version 2.0. See `LICENSE`.
