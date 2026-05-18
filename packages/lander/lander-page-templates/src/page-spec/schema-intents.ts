import type { SchemaSpec } from "@mdwrk/lander-content-contract";
import type { DomainTemplateData, TemplateRenderContext } from "../types.js";

export function schemaIntentsFromKinds(context: TemplateRenderContext<DomainTemplateData>, fallbackKinds: SchemaSpec["kind"][] = ["WebPage"]): SchemaSpec[] {
  const kinds = context.instance.data.schemaKinds ?? fallbackKinds;
  return kinds.map((kind) => ({
    id: `${context.instance.id}:${String(kind).toLowerCase()}`,
    kind,
    data: {
      name: context.instance.title,
      description: context.instance.description,
      url: context.instance.slug,
    },
  }));
}
