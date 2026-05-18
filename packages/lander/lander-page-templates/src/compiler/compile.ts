import { buildPageSpecsFromGraph } from "../page-spec/build-page-spec.js";
import { resolveLinkSlots } from "../relationships/resolve.js";
import { errorDiagnostic } from "../diagnostics.js";
import type {
  CompiledPageTemplateGraphManifest,
  GeneratedPageTemplateContentPack,
  MarkdownPageTemplateCompileInput,
  PageInstance,
  PageTemplateCompileResult,
  PageTemplateSourceDocument,
  PageTemplateSourceLink,
  TemplateEdge,
  TemplateGraph,
} from "../types.js";
import { markdownFileToSourcePage } from "./frontmatter.js";

function sourceLinkToEdge(link: PageTemplateSourceLink, graph: Pick<TemplateGraph, "templates" | "instances">): TemplateEdge {
  const source = graph.instances.find((instance) => instance.id === link.sourceId);
  const template = graph.templates.find((item) => item.id === source?.templateId);
  const slot = template?.linkSlots?.find((item) => item.id === link.slotId);
  return {
    sourceId: link.sourceId,
    targetId: link.targetId,
    relationship: link.relationship ?? slot?.relationship ?? link.slotId ?? "links_to",
    role: link.role,
    slotId: link.slotId,
    order: link.order,
    label: link.label,
  };
}

function sourcePageToInstance(page: PageTemplateSourceDocument["pages"][number]): PageInstance {
  return {
    id: page.id,
    templateId: page.templateId,
    slug: page.slug,
    title: page.title,
    description: page.description,
    data: {
      ...(page.data ?? {}),
      ...(page.body ? { body: page.body } : {}),
    },
    order: page.order,
    href: page.href,
    label: page.label,
  };
}

function manifestForGraph(id: string | undefined, graph: TemplateGraph): CompiledPageTemplateGraphManifest {
  const routes = graph.instances.map((instance) => ({
    slug: instance.slug,
    pageId: instance.id,
    templateId: instance.templateId,
    title: instance.title,
  }));
  const edges = graph.instances.flatMap((instance) => Object.values(resolveLinkSlots(graph, instance.id)).flat());
  const templates = new Map(graph.templates.map((template) => [template.id, template]));
  const terminalPageIds = graph.instances
    .filter((instance) => templates.get(instance.templateId)?.topology?.childPolicy === "terminal")
    .map((instance) => instance.id);
  return { id, routes, edges, terminalPageIds };
}

export function compilePageTemplateSource(source: PageTemplateSourceDocument): PageTemplateCompileResult {
  const templates = [...(source.templates ?? []), ...(source.bundles ?? []).flatMap((bundle) => bundle.templates)];
  const instances = source.pages.map(sourcePageToInstance);
  const graph: TemplateGraph = {
    templates,
    bundles: source.bundles,
    rules: source.rules,
    instances,
    edges: (source.links ?? []).map((link) => sourceLinkToEdge(link, { templates, instances })),
  };
  const built = buildPageSpecsFromGraph(graph);
  const seenRoutes = new Map<string, PageInstance>();
  for (const instance of graph.instances) {
    const duplicate = seenRoutes.get(instance.slug);
    if (duplicate) {
      built.diagnostics.push(errorDiagnostic({
        code: "source.route.duplicate",
        message: `Page instances ${duplicate.id} and ${instance.id} compile to duplicate route ${instance.slug}.`,
        instanceId: instance.id,
        templateId: instance.templateId,
      }));
    }
    seenRoutes.set(instance.slug, instance);
  }
  return {
    ...built,
    graph,
    manifest: manifestForGraph(source.id, graph),
  };
}

export function compileImperativePageTemplates(source: PageTemplateSourceDocument): PageTemplateCompileResult {
  return compilePageTemplateSource({ ...source, kind: "imperative" });
}

export function compileMarkdownPageTemplates(input: MarkdownPageTemplateCompileInput): PageTemplateCompileResult {
  const pages = [];
  const links = [];
  for (const file of input.files) {
    const source = markdownFileToSourcePage(file.raw, file.path);
    pages.push(source.page);
    links.push(...source.links);
  }
  return compilePageTemplateSource({
    id: input.id,
    kind: "markdown",
    templates: input.templates,
    bundles: input.bundles,
    rules: input.rules,
    pages,
    links,
  });
}

export function createGeneratedPageTemplateContentPack(input: {
  packageName: string;
  version: string;
  compiled: PageTemplateCompileResult;
}): GeneratedPageTemplateContentPack {
  return Object.freeze({
    packageName: input.packageName,
    version: input.version,
    graph: input.compiled.graph,
    pages: Object.freeze(input.compiled.pages),
    diagnostics: Object.freeze(input.compiled.diagnostics),
    routes: Object.freeze(input.compiled.manifest.routes),
    manifest: Object.freeze(input.compiled.manifest),
  });
}
