# mdwrk/testing

[![Hits](https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.packages.shared.testing.readme&left_text=hits)](https://github.com/groupsum/markdown_workspace/blob/master/packages/shared/testing/README.md)
[![Downloads](https://img.shields.io/npm/dm/%40mdwrk%2Ftesting?label=downloads)](https://www.npmjs.com/package/@mdwrk/testing)

Shared browser and timing test helpers for MdWrk packages.

## Exports

- `mdwrk/testing` — browser and timing helpers
- `mdwrk/testing/browser` — memory storage and browser stubs
- `mdwrk/testing/timing` — async timing helpers
- `mdwrk/testing/vitest-setup` — installs common jsdom-friendly browser stubs

## Example

```ts
import { createMemoryStorage } from "@mdwrk/testing/browser";
import { flushMicrotasks } from "@mdwrk/testing/timing";
```
