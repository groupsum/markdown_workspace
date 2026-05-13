<div align="center">
# MdWrk Tooling
**CI, release, conformance, and governance scripts**
[![Hits](https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.tools_README&left_text=hits)](https://github.com/groupsum/markdown_workspace/blob/master/tools/README.md)
[![Downloads](https://img.shields.io/github/downloads/groupsum/markdown_workspace/total?label=downloads)](https://github.com/groupsum/markdown_workspace/releases)
[![Node](https://img.shields.io/badge/node-20.x%20%7C%2021.x%20%7C%2022.x-339933?logo=node.js&logoColor=white)](../package.json)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](../LICENSE)
</div>

This directory contains the scripts that build, validate, package, sign, and certify the MdWrk workspace.

## Why
Strong engineering READMEs explain the operational surface clearly. This README makes it obvious where CI, release, extension, and governance automation live.

## What
- `tools/ci/` for build matrices, smoke lanes, and workflow helpers.
- `tools/conformance/` for validation, evidence generation, and package-boundary checks.
- `tools/extensions/` for installable extension bundle generation, signing, and verification.
- `tools/release/` for packaging, publish support, and release evidence.
- `tools/governance/` for tree, doc-pointer, and SSOT graph validation.

## Installation
Node.js 20.x through 22.x, matching the workspace engine contract in the root package manifest.

```bash
npm install
```

## Usage
Run the main workspace lanes from the root package manifest.

```bash
npm run ci:governance
npm run conformance
npm run release:prepare
```

## Related
- [Root README](../README.md) - repo overview
- [Docs](../docs/README.md) - operations and conformance context
- [Packages](../packages/README.md) - consumable library surfaces
