<div align="center">
# @mdwrk/testing
**Shared test utilities**
[![Hits](https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.packages_shared_testing_README&left_text=hits)](https://github.com/groupsum/markdown_workspace/blob/master/packages/shared/testing/README.md)
[![Downloads](https://img.shields.io/npm/dm/%40mdwrk%2Ftesting?label=downloads)](https://www.npmjs.com/package/@mdwrk/testing)
[![Node](https://img.shields.io/badge/node-20.x%20%7C%2021.x%20%7C%2022.x-339933?logo=node.js&logoColor=white)](../../../package.json)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](../../../LICENSE)
</div>

This package provides lightweight browser and timing helpers reused by MdWrk package tests.

## Maintenance Status
This is a legacy bridge package in `groupsum/markdown_workspace`.

- Active maintenance moved to `groupsum/mdwrk`.
- Install compatibility remains on the same npm package name: `@mdwrk/testing`.
- Repository source of truth: [https://github.com/groupsum/mdwrk/tree/master/packages/shared/testing](https://github.com/groupsum/mdwrk/tree/master/packages/shared/testing)
- Bridge releases from this repo emit an install-time deprecation warning so downstream users can migrate without an immediate package rename.

## Why
Use it when you need small shared test utilities without dragging app-specific test setup into library packages.

## What
- In-memory storage helpers.
- A `matchMedia` stub for browser-like test environments.
- Timing helpers shared across package test suites.

## Installation
Node.js 20.x through 22.x, matching the workspace engine contract in the root package manifest.

```bash
npm install -D @mdwrk/testing
```

## Usage
```ts
import { createMemoryStorage, installMatchMediaStub } from "@mdwrk/testing";

const storage = createMemoryStorage({ draft: "# MdWrk" });
const restore = installMatchMediaStub(false);

restore();
```

## Related
- [Packages index](../../README.md) - family and package navigation
- [Root README](../../../README.md) - repo overview
