<div align="center">
# @mdwrk/extension-gemini-agent
**Gemini workflow extension**
[![Hits](https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.packages_extensions_extension_gemini_agent_README&left_text=hits)](https://github.com/groupsum/markdown_workspace/blob/master/packages/extensions/extension-gemini-agent/README.md)
[![Downloads](https://img.shields.io/npm/dm/%40mdwrk%2Fextension-gemini-agent?label=downloads)](https://www.npmjs.com/package/@mdwrk/extension-gemini-agent)
[![Node](https://img.shields.io/badge/node-20.x%20%7C%2021.x%20%7C%2022.x-339933?logo=node.js&logoColor=white)](../../../package.json)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](../../../LICENSE)
</div>

This package provides the first-party Gemini workflow extension with conversation threads, Markdown preview, draft-based writeback, and a bundled operator view.

## Why
Use it when you need AI-assisted drafting as an extension surface instead of embedding it directly in the shell.

## What
- Bundled Gemini agent views and services.
- Settings, prompt, provider, and sidebar/view components.
- A concrete example of a richer first-party MdWrk extension package.

## Installation
Node.js 20.x through 22.x, matching the workspace engine contract in the root package manifest.

```bash
npm install @mdwrk/extension-gemini-agent @mdwrk/extension-runtime
```

## Usage
Register the package as a bundled extension in a host that exposes editor, workspace, and notification APIs.

## Related
- [Packages index](../../README.md) - family and package navigation
- [Root README](../../../README.md) - repo overview
