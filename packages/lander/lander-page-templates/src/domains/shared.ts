import type { PageKind, PageSpec, SchemaSpec } from "@mdwrk/lander-content-contract";
import { definePageTemplate } from "../define.js";
import { defaultSections } from "../page-spec/sections.js";
import { schemaIntentsFromKinds } from "../page-spec/schema-intents.js";
import type { DomainTemplateData, LinkSlotDefinition, PageTemplate, TemplateDomain, TemplateTopology } from "../types.js";

export interface DomainPageTemplateOptions {
  id: string;
  domain: TemplateDomain;
  kind: PageKind;
  title: string;
  description: string;
  fallbackSchemaKinds?: SchemaSpec["kind"][];
  linkSlots?: LinkSlotDefinition[];
  topology?: TemplateTopology;
}

export function createDomainPageTemplate(options: DomainPageTemplateOptions): PageTemplate<DomainTemplateData> {
  return definePageTemplate<DomainTemplateData>({
    id: options.id,
    domain: options.domain,
    kind: options.kind,
    title: options.title,
    description: options.description,
    linkSlots: options.linkSlots,
    topology: options.topology,
    buildPage: (context): PageSpec => ({
      kind: options.kind,
      slug: context.instance.slug,
      title: context.instance.title,
      description: context.instance.description,
      h1: context.instance.title,
      intro: context.instance.data.intro ?? context.instance.data.summary ?? context.instance.description,
      sections: defaultSections(context.instance.data, context.instance.title, context.instance.description),
      faq: context.instance.data.faq,
    }),
    schema: (context) => schemaIntentsFromKinds(context, options.fallbackSchemaKinds ?? ["WebPage"]),
  });
}
