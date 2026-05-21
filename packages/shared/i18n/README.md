<div align="center">
# @mdwrk/i18n
**Locale registry and message helpers**
[![Hits](https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.packages_shared_i18n_README&left_text=hits)](https://github.com/groupsum/markdown_workspace/blob/master/packages/shared/i18n/README.md)
[![Downloads](https://img.shields.io/npm/dm/%40mdwrk%2Fi18n?label=downloads)](https://www.npmjs.com/package/@mdwrk/i18n)
[![Node](https://img.shields.io/badge/node-20.x%20%7C%2021.x%20%7C%2022.x-339933?logo=node.js&logoColor=white)](../../../package.json)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](../../../LICENSE)
</div>

This package provides shared message descriptors, locale catalogs, loaders, and registry helpers for MdWrk packages and apps.

## Maintenance Status
This is a legacy bridge package in `groupsum/markdown_workspace`.

- Active maintenance moved to `groupsum/mdwrk`.
- Install compatibility remains on the same npm package name: `@mdwrk/i18n`.
- Repository source of truth: [https://github.com/groupsum/mdwrk/tree/master/packages/shared/i18n](https://github.com/groupsum/mdwrk/tree/master/packages/shared/i18n)
- Bridge releases from this repo emit an install-time deprecation warning so downstream users can migrate without an immediate package rename.

## Why
Use it when you need a lightweight i18n layer shared across packages rather than app-specific localization code.

## What
- Locale registry creation and catalog registration.
- Message descriptor normalization and formatting.
- Helpers for package-level locale loading and fallback handling.

## Installation
Node.js 20.x through 22.x, matching the workspace engine contract in the root package manifest.

```bash
npm install @mdwrk/i18n
```

## Usage
```ts
import { createLocaleRegistry } from "@mdwrk/i18n";

const registry = createLocaleRegistry({ defaultLocale: "en" });
registry.registerCatalog({
  locale: "en",
  messages: { greeting: { defaultMessage: "Hello {name}" } },
});

registry.resolve({ key: "greeting", defaultMessage: "Hello {name}" }, { name: "MdWrk" });
```

## Related
- [Packages index](../../README.md) - family and package navigation
- [Root README](../../../README.md) - repo overview
