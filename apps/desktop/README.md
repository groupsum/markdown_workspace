<div align="center">
# @mdwrk/desktop
**Native shell wrapper**
[![Hits](https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.apps_desktop_README&left_text=hits)](https://github.com/groupsum/markdown_workspace/blob/master/apps/desktop/README.md)
[![Downloads](https://img.shields.io/github/downloads/groupsum/markdown_workspace/total?label=downloads)](https://github.com/groupsum/markdown_workspace/releases)
[![Node](https://img.shields.io/badge/node-20.x%20%7C%2021.x%20%7C%2022.x-339933?logo=node.js&logoColor=white)](../../package.json)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](../../LICENSE)
</div>

`@mdwrk/desktop` wraps the MdWrk client for Electron desktop delivery and Capacitor Android packaging.

## Why
The desktop surface is a host wrapper, not a second client implementation. This README makes that relationship explicit and gives maintainers one place for build and distribution commands.

## What
- Electron packaging for desktop environments.
- Capacitor Android packaging on top of the same client build.
- A workspace-private surface that depends on the client package and shared release tooling.

## Installation
Node.js 20.x through 22.x, matching the workspace engine contract in the root package manifest.

```bash
npm install
npm run build:desktop
```

## Usage
```bash
npm run build:desktop
npm run build:desktop:dist
npm run build:android
```

Build the client first if you are debugging the packaged shell manually. The root scripts already encode that dependency chain.

## Related
- [Client app](../client/README.md) - hosted web client
- [Root README](../../README.md) - repo overview
- [Tooling](../../tools/README.md) - desktop build and release helpers
