import type { PageSpec } from "@mdwrk/lander-content-contract";
import type { PageInstance, PageTemplate, TemplateBuildResult, TemplateGraph, TemplateRenderContext } from "../types.js";
import { errorDiagnostic } from "../diagnostics.js";
import { deriveTemplateNavigation } from "../relationships/navigation.js";
import { resolveLinkSlots } from "../relationships/resolve.js";
import { validateTemplateGraph } from "../relationships/validate.js";
import { componentIntentsForTemplate } from "./component-intents.js";

export function findTemplateForInstance(graph: TemplateGraph, instance: PageInstance): PageTemplate | undefined {
  return graph.templates.find((template) => template.id === instance.templateId);
}

export function buildPageSpecFromTemplate<TData extends Record<string, unknown>>(graph: TemplateGraph, instance: PageInstance<TData>): PageSpec {
  const template = findTemplateForInstance(graph, instance) as PageTemplate<TData> | undefined;
  if (!template) {
    throw new Error(`Missing page template ${instance.templateId} for instance ${instance.id}.`);
  }

  const links = resolveLinkSlots(graph, instance.id);
  const navigation = deriveTemplateNavigation(graph, instance.id);
  const context: TemplateRenderContext<TData> = { graph, instance, template, links, navigation };
  const page = template.buildPage(context);
  const schema = [...(page.schema ?? []), ...(template.schema?.(context) ?? [])];
  const componentIntents = [
    ...(page.componentIntents ?? []),
    ...componentIntentsForTemplate(context),
    ...(template.componentIntents?.(context) ?? []),
  ];

  return {
    ...page,
    schema,
    componentIntents,
  };
}

export function buildPageSpecsFromGraph(graph: TemplateGraph): TemplateBuildResult {
  const diagnostics = validateTemplateGraph(graph);
  const pages: PageSpec[] = [];

  for (const instance of graph.instances) {
    const template = findTemplateForInstance(graph, instance);
    if (!template) {
      diagnostics.push(errorDiagnostic({
        code: "page.build.template.missing",
        message: `Cannot build ${instance.id}; template ${instance.templateId} is missing.`,
        instanceId: instance.id,
        templateId: instance.templateId,
      }));
      continue;
    }
    pages.push(buildPageSpecFromTemplate(graph, instance));
  }

  return { pages, diagnostics };
}
