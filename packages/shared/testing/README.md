# mdwrk/testing

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
