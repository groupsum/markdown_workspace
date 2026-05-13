# MdWrk Shared

**Tokens, icons, i18n, testing, and discovery helpers**

<p align="center">
  <a href="https://github.com/groupsum/markdown_workspace/blob/master/packages/shared/README.md"><img alt="Hits" src="https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.packages_shared_README&amp;left_text=hits" /></a>
  <a href="https://github.com/groupsum/markdown_workspace/releases"><img alt="Downloads" src="https://img.shields.io/github/downloads/groupsum/markdown_workspace/total?label=downloads" /></a>
  <a href="../../package.json"><img alt="Node" src="https://img.shields.io/badge/node-20.x%20%7C%2021.x%20%7C%2022.x-339933?logo=node.js&amp;logoColor=white" /></a>
  <a href="../../LICENSE"><img alt="License: Apache-2.0" src="https://img.shields.io/badge/license-Apache--2.0-blue.svg" /></a>
</p>

The shared family holds the primitives reused across MdWrk packages, apps, themes, and public-site generation.

## Why
Good package repos keep primitives discoverable and separate from feature packages. This index shows what is intentionally shared across the workspace.

## What
- `@mdwrk/ui-tokens` for token defaults and class-facing theme data.
- `@mdwrk/icons` for workspace icon identifiers and metadata.
- `@mdwrk/i18n` for locale catalogs and runtime formatting helpers.
- `@mdwrk/testing` for lightweight browser and timing test utilities.
- `@mdwrk/structured-data` for Schema.org and JSON-LD builders.

## Installation
Node.js 20.x through 22.x, matching the workspace engine contract in the root package manifest.

```bash
npm install @mdwrk/ui-tokens @mdwrk/icons @mdwrk/i18n @mdwrk/testing @mdwrk/structured-data
```

## Usage
Pull these packages into apps and higher-level libraries when you need stable primitives instead of app-specific implementations.

- [ui-tokens](./ui-tokens/README.md)
- [icons](./icons/README.md)
- [i18n](./i18n/README.md)
- [testing](./testing/README.md)
- [structured-data](./structured-data/README.md)

## Related
- [Contracts family](../contracts/README.md) - theme contract and extension types
- [Lander family](../lander/README.md) - consumers of structured-data helpers
