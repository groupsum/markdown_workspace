# Extension packages

[![Hits](https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.packages.extensions.readme&left_text=hits)](https://github.com/groupsum/markdown_workspace/blob/master/packages/extensions/README.md)
[![Downloads](https://img.shields.io/github/downloads/groupsum/markdown_workspace/total?label=downloads)](https://github.com/groupsum/markdown_workspace/releases)

This package family contains the runtime, first-party extension packages, and a sample third-party external extension package for MdWrk.

## Current packages

- `packages/extensions/extension-runtime/` — shared runtime for bundled and external extensions
- `packages/extensions/extension-manager/` — first-party operator console extension
- `packages/extensions/extension-gemini-agent/` — first-party AI workflow extension
- `packages/extensions/extension-theme-studio/` — first-party theme authoring extension
- `packages/extensions/extension-catalog-hello/` — sample third-party external extension package used to validate the formal catalog path

## Documentation / Evidence Status

Each extension package now has:

- a package README
- generated API/reference docs under `docs/reference/packages/`
- manifest/compatibility evidence in the package evidence matrix
- lifecycle/integration test evidence in the conformance artifact set

## Reference docs

- `docs/reference/workspace-package-certification-matrix.md`
- `docs/reference/package-boundary-map.md`
