import type { ComponentIntentSpec } from "@mdwrk/lander-content-contract";
import type { TemplateRenderContext } from "../types.js";

export function componentIntentsForTemplate(context: TemplateRenderContext): ComponentIntentSpec[] {
  return [
    {
      id: `${context.instance.id}:page-template`,
      kind: "page_shell",
      sourceId: context.template.id,
      data: {
        templateId: context.template.id,
        domain: context.template.domain,
      },
    },
    {
      id: `${context.instance.id}:template-links`,
      kind: "breadcrumbs",
      sourceId: context.instance.id,
      data: {
        slots: Object.keys(context.links).sort(),
      },
    },
  ];
}
