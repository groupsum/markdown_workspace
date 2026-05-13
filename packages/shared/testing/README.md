# @mdwrk/testing

**Shared test utilities**

<p align="center">
  <a href="https://github.com/groupsum/markdown_workspace/blob/master/packages/shared/testing/README.md"><img alt="Hits" src="https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.packages_shared_testing_README&amp;left_text=hits" /></a>
  <a href="https://www.npmjs.com/package/@mdwrk/testing"><img alt="Downloads" src="https://img.shields.io/npm/dm/%40mdwrk%2Ftesting?label=downloads" /></a>
  <a href="../../../package.json"><img alt="Node" src="https://img.shields.io/badge/node-20.x%20%7C%2021.x%20%7C%2022.x-339933?logo=node.js&amp;logoColor=white" /></a>
  <a href="../../../LICENSE"><img alt="License: Apache-2.0" src="https://img.shields.io/badge/license-Apache--2.0-blue.svg" /></a>
</p>

This package provides lightweight browser and timing helpers reused by MdWrk package tests.

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
