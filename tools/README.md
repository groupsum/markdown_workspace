# MdWrk Tooling

**CI, release, conformance, and governance scripts**

<p align="center">
  <a href="https://github.com/groupsum/markdown_workspace/blob/master/tools/README.md"><img alt="Hits" src="https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.tools_README&amp;left_text=hits" /></a>
  <a href="https://github.com/groupsum/markdown_workspace/releases"><img alt="Downloads" src="https://img.shields.io/github/downloads/groupsum/markdown_workspace/total?label=downloads" /></a>
  <a href="../package.json"><img alt="Node" src="https://img.shields.io/badge/node-20.x%20%7C%2021.x%20%7C%2022.x-339933?logo=node.js&amp;logoColor=white" /></a>
  <a href="../LICENSE"><img alt="License: Apache-2.0" src="https://img.shields.io/badge/license-Apache--2.0-blue.svg" /></a>
</p>

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
