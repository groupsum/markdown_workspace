<div align="center">

# Markdown Workspace

[![CI](https://img.shields.io/github/actions/workflow/status/swarmauri/markdown_workspace/ci.yml?branch=master&label=CI)](./.github/workflows/ci.yml)
[![Conformance](https://img.shields.io/github/actions/workflow/status/swarmauri/markdown_workspace/conformance.yml?branch=master&label=Conformance)](./.github/workflows/conformance.yml)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](./LICENSE)
[![Node >=20](https://img.shields.io/badge/node-%3E%3D20-339933?logo=node.js&logoColor=white)](./package.json)
[![Repo Size](https://img.shields.io/github/repo-size/swarmauri/markdown_workspace)](.)
[![Last Commit](https://img.shields.io/github/last-commit/swarmauri/markdown_workspace)](.)
[![Issues](https://img.shields.io/github/issues/swarmauri/markdown_workspace)](../../issues)
[![Discussions](https://img.shields.io/badge/GitHub-Discussions-6e5494?logo=github)](../../discussions)

</div>

`markdown_workspace` is a multi-package Markdown platform repository containing deployable apps, reusable packages, extensions, conformance pipelines, and release evidence artifacts.

## Table of contents

- [Repository details](#repository-details)
- [Repository standards and specs](#repository-standards-and-specs)
- [Documentation pointers](#documentation-pointers)
- [Governance and CI validation](#governance-and-ci-validation)
- [Contributing](#contributing)
- [License](#license)

## Repository details

- **Applications:** `apps/client`, `apps/lander`
- **Packages:** `packages/contracts`, `packages/shared`, `packages/renderer`, `packages/editor`, `packages/extensions`
- **Operational tooling:** `tools/`
- **Evidence artifacts:** `artifacts/`
- **Standards/specifications:** `specs/`

## Repository standards and specs

All repository governance specifications are located in [`specs/`](./specs/README.md). Each governance test prints the relevant spec path when failing.

Governance specs include:

- repository tree validation
- documentation pointer validation
- root clutter validation
- generated-artifact protection
- claim-language lint requirements
- WIP-notes validation
- release-note validation

## Documentation pointers

- Documentation index: [`docs/README.md`](./docs/README.md)
- Agent instructions: [`agents.md`](./agents.md)
- Contribution guide: [`CONTRIBUTING.md`](./CONTRIBUTING.md)
- Code of conduct: [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md)
- Apache 2.0 license: [`LICENSE`](./LICENSE)
- CI workflows: [`.github/workflows/`](./.github/workflows)

## Governance and CI validation

Governance validations run through `npm run test:governance` and are wired into the main CI workflow.

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for branch, change, and validation expectations.

## License

This repository is licensed under the Apache License 2.0. See [`LICENSE`](./LICENSE).
