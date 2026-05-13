# mdwrk/icons

[![Hits](https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.packages.shared.icons.readme&left_text=hits)](https://github.com/groupsum/markdown_workspace/blob/master/packages/shared/icons/README.md)
[![Downloads](https://img.shields.io/npm/dm/%40mdwrk%2Ficons?label=downloads)](https://www.npmjs.com/package/@mdwrk/icons)

Shared icon identifiers and icon metadata for MdWrk applications and packages.

This package does not force a rendering library. Instead it provides a stable icon identifier and metadata catalog so applications and reusable packages can render icons with Lucide, SVG assets, or another adapter while keeping semantic IDs stable.

## Example

```ts
import { getWorkspaceIconDefinition } from "@mdwrk/icons";

const icon = getWorkspaceIconDefinition("extension.manager");
// => { id: "extension.manager", lucideName: "Puzzle", ... }
```
