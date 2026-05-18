# @mdwrk/extension-language-pack-studio

First-party language-pack authoring extension for MdWrk hosts that need localization inspection, catalog editing, and language-pack workflow surfaces inside the extension system.

<p align="center">
  <a href="https://github.com/groupsum/markdown_workspace/blob/master/packages/extensions/extension-language-pack-studio/README.md"><img alt="Hits" src="https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.packages_extensions_extension_language_pack_studio_README&amp;left_text=hits" /></a>
  <a href="https://www.npmjs.com/package/@mdwrk/extension-language-pack-studio"><img alt="Downloads" src="https://img.shields.io/npm/dm/%40mdwrk%2Fextension-language-pack-studio?label=downloads" /></a>
  <a href="../../../package.json"><img alt="Node" src="https://img.shields.io/badge/node-20.x%20%7C%2021.x%20%7C%2022.x-339933?logo=node.js&amp;logoColor=white" /></a>
  <a href="../../../LICENSE"><img alt="License: Apache-2.0" src="https://img.shields.io/badge/license-Apache--2.0-blue.svg" /></a>
</p>

This package provides the bundled manifest, runtime entrypoint, workspace module, command registration, action-rail item, settings section, and sample-pack assets for MdWrk language-pack authoring.

## Why
Use it when localization authoring should remain an extension concern instead of being hard-wired into the app shell. The package owns the studio extension boundary; the host still supplies catalog storage, workspace state, and persistence.

## What
- Bundled extension metadata for the language-pack studio surface.
- A `createLanguagePackStudioBundledEntry` factory for registering the studio command, workspace module, action-rail placement, and settings.
- Catalog loading helpers and sample packs for host integration and tests.

## Installation
Node.js 20.x through 22.x, matching the workspace engine contract in the root package manifest.

```bash
npm install @mdwrk/extension-language-pack-studio @mdwrk/extension-runtime
```

## Usage
Load it from a host that already provides the MdWrk extension runtime, i18n services, and workspace state.

```ts
import { createLanguagePackStudioBundledEntry } from "@mdwrk/extension-language-pack-studio";

const languagePackStudioEntry = createLanguagePackStudioBundledEntry({
  controller: host.languagePackStudioController,
});
```

The package also exposes `./manifest`, `./types`, `./version`, and `./bundled` subpath exports for hosts that load extension metadata separately from bundled entry registration.

## Related
- [Packages index](../../README.md) - family and package navigation
- [Root README](../../../README.md) - repo overview
