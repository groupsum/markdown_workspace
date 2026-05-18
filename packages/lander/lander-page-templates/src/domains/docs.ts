import { defineTemplateBundle } from "../define.js";
import { createDomainPageTemplate } from "./shared.js";

export const docsTemplates = [
  createDomainPageTemplate({ id: "docs.hub", domain: "docs", kind: "docs_bridge", title: "Docs hub", description: "Documentation hub page.", fallbackSchemaKinds: ["WebPage"], linkSlots: [{ id: "children", relationship: "child", cardinality: "optional_many", ordered: true }] }),
  createDomainPageTemplate({ id: "docs.guide", domain: "docs", kind: "docs_bridge", title: "Guide page", description: "Documentation guide page.", fallbackSchemaKinds: ["TechArticle"], linkSlots: [{ id: "parent", relationship: "parent", cardinality: "optional_one" }, { id: "previous", relationship: "previous", cardinality: "optional_one" }, { id: "next", relationship: "next", cardinality: "optional_one" }] }),
  createDomainPageTemplate({ id: "docs.reference", domain: "docs", kind: "docs_bridge", title: "Reference page", description: "Reference documentation page.", fallbackSchemaKinds: ["TechArticle"] }),
  createDomainPageTemplate({ id: "docs.tutorial", domain: "docs", kind: "docs_bridge", title: "Tutorial page", description: "Tutorial documentation page.", fallbackSchemaKinds: ["HowTo"] }),
  createDomainPageTemplate({ id: "docs.release-note", domain: "docs", kind: "docs_bridge", title: "Release note page", description: "Release note page.", fallbackSchemaKinds: ["Article"] }),
];

export const docsDomainBundle = defineTemplateBundle({
  id: "domain.docs",
  domain: "docs",
  title: "Documentation page templates",
  templates: docsTemplates,
});
