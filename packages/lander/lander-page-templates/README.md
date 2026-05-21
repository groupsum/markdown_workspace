# @mdwrk/lander-page-templates

Portable page-template definitions and graph resolution for MdWrk lander sites.

## Maintenance Status

This is a legacy bridge package in `groupsum/markdown_workspace`.

- Active maintenance moved to `groupsum/mdwrk-pages`.
- Install compatibility remains on the same npm package name: `@mdwrk/lander-page-templates`.
- Repository source of truth: [https://github.com/groupsum/mdwrk-pages/tree/master/packages/lander/lander-page-templates](https://github.com/groupsum/mdwrk-pages/tree/master/packages/lander/lander-page-templates)
- Bridge releases from this repo emit an install-time deprecation warning so downstream users can migrate without an immediate package rename.

This package owns reusable page recipes, typed page instances, semantic relationships, link-slot resolution, navigation derivation, and conversion to `@mdwrk/lander-content-contract` `PageSpec` objects.

It does not own product copy, app routes, or React rendering. Downstream content packs create instances and edges; `@mdwrk/lander-react` renders the generated `PageSpec` output.

## Usage

```ts
import {
  buildPageSpecFromTemplate,
  definePageInstance,
  defineTemplateGraph,
  educationDomainBundle,
} from "@mdwrk/lander-page-templates";

const graph = defineTemplateGraph({
  templates: educationDomainBundle.templates,
  instances: [
    definePageInstance({
      id: "course:intro",
      templateId: "education.course",
      slug: "/courses/intro/",
      title: "Intro Course",
      description: "A focused introduction course.",
      data: { summary: "Learn the core workflow.", modules: ["Module 1"] },
    }),
  ],
  edges: [],
});

const page = buildPageSpecFromTemplate(graph, graph.instances[0]);
```
