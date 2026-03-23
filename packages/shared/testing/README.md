# @markdown-workspace/testing

Shared browser and timing test helpers for Markdown Workspace packages.

## Exports

- `@markdown-workspace/testing` — browser and timing helpers
- `@markdown-workspace/testing/browser` — memory storage and browser stubs
- `@markdown-workspace/testing/timing` — async timing helpers
- `@markdown-workspace/testing/vitest-setup` — installs common jsdom-friendly browser stubs

## Example

```ts
import { createMemoryStorage } from "@markdown-workspace/testing/browser";
import { flushMicrotasks } from "@markdown-workspace/testing/timing";
```
