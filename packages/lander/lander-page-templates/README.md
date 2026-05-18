# @mdwrk/lander-page-templates

Portable page-template definitions and graph resolution for MdWrk lander sites.

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
