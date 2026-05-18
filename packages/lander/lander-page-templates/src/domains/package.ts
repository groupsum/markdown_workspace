import { defineTemplateBundle } from "../define.js";
import { createDomainPageTemplate } from "./shared.js";

export const packageTemplates = [
  createDomainPageTemplate({ id: "package.catalog", domain: "package", kind: "package", title: "Package catalog", description: "Package catalog page.", fallbackSchemaKinds: ["ItemList"], linkSlots: [{ id: "packages", relationship: "child", cardinality: "optional_many", ordered: true }] }),
  createDomainPageTemplate({ id: "package.detail", domain: "package", kind: "package", title: "Package detail", description: "Package detail page.", fallbackSchemaKinds: ["SoftwareSourceCode"], linkSlots: [{ id: "parent", relationship: "parent", cardinality: "optional_one" }, { id: "related", relationship: "related", cardinality: "optional_many" }] }),
  createDomainPageTemplate({ id: "package.api", domain: "package", kind: "docs_bridge", title: "Package API", description: "Package API reference page.", fallbackSchemaKinds: ["TechArticle"] }),
  createDomainPageTemplate({ id: "package.plugin", domain: "package", kind: "package", title: "Plugin page", description: "Plugin package page.", fallbackSchemaKinds: ["SoftwareApplication"] }),
  createDomainPageTemplate({ id: "package.version", domain: "package", kind: "docs_bridge", title: "Package version", description: "Package version page.", fallbackSchemaKinds: ["SoftwareSourceCode"] }),
];

export const packageDomainBundle = defineTemplateBundle({
  id: "domain.package",
  domain: "package",
  title: "Package page templates",
  templates: packageTemplates,
});
