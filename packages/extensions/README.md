<div align="center">
# MdWrk Extensions
**Runtime and first-party bundled extensions**
[![Hits](https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.packages_extensions_README&left_text=hits)](https://github.com/groupsum/markdown_workspace/blob/master/packages/extensions/README.md)
[![Downloads](https://img.shields.io/github/downloads/groupsum/markdown_workspace/total?label=downloads)](https://github.com/groupsum/markdown_workspace/releases)
[![Node](https://img.shields.io/badge/node-20.x%20%7C%2021.x%20%7C%2022.x-339933?logo=node.js&logoColor=white)](../../package.json)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](../../LICENSE)
</div>

The extensions family contains the runtime that loads MdWrk extensions and the first-party bundled packages that register views, actions, and services.

## Why
Extension ecosystems need clear boundaries between contracts, runtime, and concrete packages. This family README points readers to the right layer immediately.

## What
- `@mdwrk/extension-runtime` for loading, compatibility, activation, storage, and catalog workflows.
- First-party bundled packages for workspace files, Git operations, extension management, Gemini workflows, theme authoring, language packs, and catalog validation.

## Installation
Node.js 20.x through 22.x, matching the workspace engine contract in the root package manifest.

```bash
npm install @mdwrk/extension-runtime @mdwrk/extension-manager @mdwrk/extension-workspace-files
```

## Usage
Use the runtime when you are building or hosting extensions. Use the individual package READMEs when you need a specific bundled capability.

- [extension-runtime](./extension-runtime/README.md)
- [extension-manager](./extension-manager/README.md)
- [extension-workspace-files](./extension-workspace-files/README.md)
- [extension-git-ops](./extension-git-ops/README.md)
- [extension-gemini-agent](./extension-gemini-agent/README.md)
- [extension-theme-studio](./extension-theme-studio/README.md)
- [extension-language-pack-studio](./extension-language-pack-studio/README.md)
- [extension-catalog-hello](./extension-catalog-hello/README.md)

## Related
- [Contracts family](../contracts/README.md) - manifest, host, and theme API contracts
- [Client app](../../apps/client/README.md) - first-party extension host
