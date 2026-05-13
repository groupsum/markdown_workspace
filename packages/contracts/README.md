<div align="center">
# MdWrk Contracts
**Theme and extension API foundations**
[![Hits](https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.packages_contracts_README&left_text=hits)](https://github.com/groupsum/markdown_workspace/blob/master/packages/contracts/README.md)
[![Downloads](https://img.shields.io/github/downloads/groupsum/markdown_workspace/total?label=downloads)](https://github.com/groupsum/markdown_workspace/releases)
[![Node](https://img.shields.io/badge/node-20.x%20%7C%2021.x%20%7C%2022.x-339933?logo=node.js&logoColor=white)](../../package.json)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](../../LICENSE)
</div>

The contracts family defines the stable type and capability boundaries shared by MdWrk themes, extension manifests, and extension hosts.

## Why
Consumers need to know where the durable API contract starts. This family README separates contract packages from runtime and UI implementations.

## What
- `@mdwrk/extension-manifest` for manifest, capability, settings, integrity, and compatibility shapes.
- `@mdwrk/extension-host` for the host-side API available to extensions at runtime.
- `@mdwrk/theme-contract` for stable theme tokens, class names, bridges, and preset compatibility.

## Installation
Node.js 20.x through 22.x, matching the workspace engine contract in the root package manifest.

```bash
npm install @mdwrk/extension-manifest @mdwrk/extension-host @mdwrk/theme-contract
```

## Usage
Use these packages when you are defining compatibility, not when you are running the runtime.

- [extension-manifest](./extension-manifest/README.md) for package metadata and capabilities.
- [extension-host](./extension-host/README.md) for host APIs exposed to extensions.
- [theme-contract](./theme-contract/README.md) for theme token and class guarantees.

## Related
- [Extensions family](../extensions/README.md) - runtime and bundled extensions
- [Shared family](../shared/README.md) - token and i18n consumers
