# @mdwrk/extension-workspace-files

First-party workspace file extension for MdWrk hosts that need project browsing, file selection, and workspace-file actions registered through the extension system.

<p align="center">
  <a href="https://github.com/groupsum/markdown_workspace/blob/master/packages/extensions/extension-workspace-files/README.md"><img alt="Hits" src="https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.packages_extensions_extension_workspace_files_README&amp;left_text=hits" /></a>
  <a href="https://www.npmjs.com/package/@mdwrk/extension-workspace-files"><img alt="Downloads" src="https://img.shields.io/npm/dm/%40mdwrk%2Fextension-workspace-files?label=downloads" /></a>
  <a href="../../../package.json"><img alt="Node" src="https://img.shields.io/badge/node-20.x%20%7C%2021.x%20%7C%2022.x-339933?logo=node.js&amp;logoColor=white" /></a>
  <a href="../../../LICENSE"><img alt="License: Apache-2.0" src="https://img.shields.io/badge/license-Apache--2.0-blue.svg" /></a>
</p>

This package provides the bundled manifest, runtime entrypoint, commands, workspace module, action-rail items, and settings section that back MdWrk's default project and file browsing experience.

## Why
Use it when the host needs the default workspace file experience rather than only custom extension views. The package owns the extension boundary; the host still supplies project state, file-system access, and persistence.

## What
- Bundled extension metadata for workspace file browsing.
- A `createWorkspaceFilesBundledEntry` factory for registering explorer commands, workspace views, action-rail placement, and settings.
- A reference first-party extension for workspace-centric host APIs.

## Installation
Node.js 20.x through 22.x, matching the workspace engine contract in the root package manifest.

```bash
npm install @mdwrk/extension-workspace-files @mdwrk/extension-runtime
```

## Usage
Load it from a host that already provides the MdWrk extension runtime and workspace-file services.

```ts
import { createWorkspaceFilesBundledEntry } from "@mdwrk/extension-workspace-files";

const workspaceFilesEntry = createWorkspaceFilesBundledEntry({
  actions: host.workspaceFileActions,
  isExplorerActive: () => host.workspaceExplorerOpen,
  renderWorkspace: (props) => host.renderWorkspaceFiles(props),
  renderExplorer: (props) => host.renderProjectExplorer(props),
  renderSettings: () => host.renderWorkspaceFileSettings(),
});
```

The package also exposes `./manifest`, `./version`, and `./bundled` subpath exports for hosts that load extension metadata separately from bundled entry registration.

## Related
- [Packages index](../../README.md) - family and package navigation
- [Root README](../../../README.md) - repo overview
