# @markdown-workspace/icons

Shared icon identifiers and icon metadata for Markdown Workspace applications and packages.

This package does not force a rendering library. Instead it provides a stable icon identifier and metadata catalog so applications and reusable packages can render icons with Lucide, SVG assets, or another adapter while keeping semantic IDs stable.

## Example

```ts
import { getWorkspaceIconDefinition } from "@markdown-workspace/icons";

const icon = getWorkspaceIconDefinition("extension.manager");
// => { id: "extension.manager", lucideName: "Puzzle", ... }
```
