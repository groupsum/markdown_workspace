# @mdwrk/i18n

**Locale registry and message helpers**

<p align="center">
  <a href="https://github.com/groupsum/markdown_workspace/blob/master/packages/shared/i18n/README.md"><img alt="Hits" src="https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.packages_shared_i18n_README&amp;left_text=hits" /></a>
  <a href="https://www.npmjs.com/package/@mdwrk/i18n"><img alt="Downloads" src="https://img.shields.io/npm/dm/%40mdwrk%2Fi18n?label=downloads" /></a>
  <a href="../../../package.json"><img alt="Node" src="https://img.shields.io/badge/node-20.x%20%7C%2021.x%20%7C%2022.x-339933?logo=node.js&amp;logoColor=white" /></a>
  <a href="../../../LICENSE"><img alt="License: Apache-2.0" src="https://img.shields.io/badge/license-Apache--2.0-blue.svg" /></a>
</p>

This package provides shared message descriptors, locale catalogs, loaders, and registry helpers for MdWrk packages and apps.

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
