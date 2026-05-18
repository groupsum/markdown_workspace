import type { PageInstance, PageTemplate, RelationshipRule, TemplateBundle, TemplateEdge, TemplateGraph } from "./types.js";

export function definePageTemplate<TData extends Record<string, unknown>>(template: PageTemplate<TData>): PageTemplate<TData> {
  return template;
}

export function definePageInstance<TData extends Record<string, unknown>>(instance: PageInstance<TData>): PageInstance<TData> {
  return instance;
}

export function defineRelationship(rule: RelationshipRule): RelationshipRule {
  return rule;
}

export function defineEdge(edge: TemplateEdge): TemplateEdge {
  return edge;
}

export function defineTemplateBundle(bundle: TemplateBundle): TemplateBundle {
  return bundle;
}

export function defineTemplateGraph(graph: TemplateGraph): TemplateGraph {
  return graph;
}
