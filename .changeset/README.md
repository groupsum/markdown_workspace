<div align="center">
# MdWrk Changesets
**Release note and versioning workspace**
[![Hits](https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace._changeset_README&left_text=hits)](https://github.com/groupsum/markdown_workspace/blob/master/.changeset/README.md)
[![Downloads](https://img.shields.io/github/downloads/groupsum/markdown_workspace/total?label=downloads)](https://github.com/groupsum/markdown_workspace/releases)
[![Node](https://img.shields.io/badge/node-20.x%20%7C%2021.x%20%7C%2022.x-339933?logo=node.js&logoColor=white)](../package.json)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](../LICENSE)
</div>

This directory stores Changesets entries that drive workspace version planning, grouped release notes, and publish-time version bumps.

## Why
High-quality package repos explain how releases are prepared, not just how code is built. This README keeps the versioning lane discoverable for maintainers.

## What
- Changeset markdown files that describe package-facing changes.
- Inputs to `npm run release:status` and `npm run release:version`.
- Release metadata for grouped SemVer movement across the MdWrk package graph.

## Installation
Node.js 20.x through 22.x, matching the workspace engine contract in the root package manifest.

```bash
npm install
npm run release:status
```

## Usage
Create or inspect release notes with Changesets from the workspace root.

```bash
npx @changesets/cli
npm run release:status
npm run release:version
```

## Related
- [Root README](../README.md) - repo overview
- [Operations docs](../docs/README.md) - release and support policy
- [Tooling](../tools/README.md) - release scripts
