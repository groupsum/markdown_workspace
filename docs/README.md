# MdWrk Docs

**Architecture, conformance, and operations**

<p align="center">
  <a href="https://github.com/groupsum/markdown_workspace/blob/master/docs/README.md"><img alt="Hits" src="https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.docs_README&amp;left_text=hits" /></a>
  <a href="https://github.com/groupsum/markdown_workspace/releases"><img alt="Downloads" src="https://img.shields.io/github/downloads/groupsum/markdown_workspace/total?label=downloads" /></a>
  <a href="../package.json"><img alt="Node" src="https://img.shields.io/badge/node-20.x%20%7C%2021.x%20%7C%2022.x-339933?logo=node.js&amp;logoColor=white" /></a>
  <a href="../LICENSE"><img alt="License: Apache-2.0" src="https://img.shields.io/badge/license-Apache--2.0-blue.svg" /></a>
</p>

The docs tree explains how MdWrk is structured, what is currently implemented, how conformance is measured, and how releases are prepared and governed.

## Why
Popular project READMEs point readers to the next right document fast. This index is the navigational hub for repo architecture, release policy, and current-state checkpoints.

## What
- Architecture notes for packages, themes, extensions, lander surfaces, and shared primitives.
- Conformance and certification guidance for markdown behavior, package boundaries, and release evidence.
- Current-state assessments for phase-by-phase implementation checkpoints.
- Operations docs for CI/CD, publishing, compatibility, and release automation.

## Installation
Node.js 20.x through 22.x, matching the workspace engine contract in the root package manifest.

```bash
npm install
```

## Usage
Read the docs alongside the relevant README surface:

- [Architecture](./architecture/package-topology.md) for package graph and boundaries.
- [Conformance](./conformance/package-documentation-phase11.md) for documentation expectations and evidence lanes.
- [Operations](./operations/release-automation.md) for publish and release flow.
- [Current state](./current-state/certifiability-phase-1-honest-scope.md) for the latest honest implementation checkpoint.

## Related
- [Root README](../README.md) - repo-level overview
- [Packages Index](../packages/README.md) - family-level package navigation
- [Tooling](../tools/README.md) - scripts that enforce these docs
