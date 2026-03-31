<div align="center">

# markdown_workspace

[![CI](https://img.shields.io/github/actions/workflow/status/swarmauri/markdown_workspace/ci.yml?branch=master&label=CI)](./.github/workflows/ci.yml)
[![Conformance](https://img.shields.io/github/actions/workflow/status/swarmauri/markdown_workspace/conformance.yml?branch=master&label=Conformance)](./.github/workflows/conformance.yml)
[![Node](https://img.shields.io/badge/node-20.x-339933?logo=node.js&logoColor=white)](./package.json)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](./LICENSE)
[![Repo Specs](https://img.shields.io/badge/specs-governed-6f42c1)](./specs/README.md)

</div>

`markdown_workspace` is a multi-package workspace for the MdWrkSpace client, lander, reusable markdown packages, extension contracts, first-party extension packages, third-party extension distribution tooling, and repository operations.

## Table of Contents
- [Repository Overview](#repository-overview)
- [Repository Structure](#repository-structure)
- [CI and Governance Conformance](#ci-and-governance-conformance)
- [Documentation Pointers](#documentation-pointers)
- [Community and Governance Files](#community-and-governance-files)
- [License](#license)

## Repository Overview
This repository contains application shells, package workspaces, extension runtime and extension distribution tooling, conformance gates, and release automation.

## Repository Structure
- `apps/` — deployable applications (`client`, `lander`)
- `packages/` — contracts, renderer, editor, shared, and extension packages
- `examples/` — runnable examples for editor/renderer integration
- `docs/` — architecture, ADRs, conformance, current-state, and operations documentation
- `specs/` — repository standards and policy specifications
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
- Repository specs index: `specs/README.md`
- Repository governance spec: `specs/repository-governance-spec.md`
- Agents guidance: `agents.md`
- Contribution guide: `CONTRIBUTING.md`
- Code of conduct: `CODE_OF_CONDUCT.md`
- License text: `LICENSE`

## Community and Governance Files
- `agents.md` defines repository-specific operating constraints for automation agents.
- `CONTRIBUTING.md` documents contributor workflow and required checks.
- `CODE_OF_CONDUCT.md` defines behavior standards for participation.

## License
Licensed under the Apache License, Version 2.0. See `LICENSE`.
