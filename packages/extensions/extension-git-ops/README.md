# @mdwrk/extension-git-ops

First-party Git operations extension for MdWrk hosts that expose repository status, source-control actions, and Git settings through the extension system.

<p align="center">
  <a href="https://github.com/groupsum/markdown_workspace/blob/master/packages/extensions/extension-git-ops/README.md"><img alt="Hits" src="https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.packages_extensions_extension_git_ops_README&amp;left_text=hits" /></a>
  <a href="https://www.npmjs.com/package/@mdwrk/extension-git-ops"><img alt="Downloads" src="https://img.shields.io/npm/dm/%40mdwrk%2Fextension-git-ops?label=downloads" /></a>
  <a href="../../../package.json"><img alt="Node" src="https://img.shields.io/badge/node-20.x%20%7C%2021.x%20%7C%2022.x-339933?logo=node.js&amp;logoColor=white" /></a>
  <a href="../../../LICENSE"><img alt="License: Apache-2.0" src="https://img.shields.io/badge/license-Apache--2.0-blue.svg" /></a>
</p>

This package provides the bundled manifest, runtime entrypoint, commands, workspace module, action-rail item, and settings section used by MdWrk's Git-oriented workflow surface.

## Why
Use it when Git workflows should be registered as a host extension instead of being hard-coded into the shell. The package owns the extension boundary; the host still supplies repository state, file operations, command execution, and persistence.

## What
- Bundled extension metadata for the Git operations surface.
- A `createGitOpsBundledEntry` factory for registering commands, views, action-rail placement, and settings.
- Typed host-facing options for integrating Git status and source-control panels.

## Installation
Node.js 20.x through 22.x, matching the workspace engine contract in the root package manifest.

```bash
npm install @mdwrk/extension-git-ops @mdwrk/extension-runtime
```

## Usage
Load it from a host that already provides the MdWrk extension runtime and workspace services.

```ts
import { createGitOpsBundledEntry } from "@mdwrk/extension-git-ops";

const gitOpsEntry = createGitOpsBundledEntry({
  isActive: () => host.gitPanelOpen,
  renderWorkspace: (props) => host.renderGitWorkspace(props),
  renderExplorer: (props) => host.renderGitExplorer(props),
  renderSettings: () => host.renderGitSettings(),
  toggleGitOps: () => host.toggleGitPanel(),
});
```

The package also exposes `./manifest`, `./version`, and `./bundled` subpath exports for hosts that load extension metadata separately from bundled entry registration.

## Related
- [Packages index](../../README.md) - family and package navigation
- [Root README](../../../README.md) - repo overview
