# @mdwrk/lander-page-template-presets

Ready-made graph presets for `@mdwrk/lander-page-templates`.

## Maintenance Status

This is a legacy bridge package in `groupsum/markdown_workspace`.

- Active maintenance moved to `groupsum/mdwrk-pages`.
- Install compatibility remains on the same npm package name: `@mdwrk/lander-page-template-presets`.
- Repository source of truth: [https://github.com/groupsum/mdwrk-pages/tree/master/packages/lander/lander-page-template-presets](https://github.com/groupsum/mdwrk-pages/tree/master/packages/lander/lander-page-template-presets)
- Bridge releases from this repo emit an install-time deprecation warning so downstream users can migrate without an immediate package rename.

Templates define reusable page recipes. Presets compose those templates into complete starter page systems: product home plus legal/support links, FAQ hubs with Q&A pages, learning paths with courses/modules/quizzes, docs hubs with ordered guides, package catalogs, and trust hubs.

Downstream content packs can use a preset as a starting graph, replace any instance data, add or remove edges, then pass the graph to `buildPageSpecsFromGraph`.

## Usage

```ts
import { buildPageSpecsFromGraph } from "@mdwrk/lander-page-templates";
import { createEducationPathPreset } from "@mdwrk/lander-page-template-presets";

const preset = createEducationPathPreset({
  baseSlug: "/learn",
  title: "Getting Started",
});

const { pages, diagnostics } = buildPageSpecsFromGraph(preset.graph);
```
