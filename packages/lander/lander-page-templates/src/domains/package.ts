import { defineTemplateBundle } from "../define.js";
import { createDomainPageTemplate } from "./shared.js";

export const packageTemplates = [
  createDomainPageTemplate({ id: "package.catalog", domain: "package", kind: "package", title: "Package catalog", description: "Package catalog page.", fallbackSchemaKinds: ["ItemList"], linkSlots: [{ id: "packages", relationship: "child", role: "tree_child", cardinality: "many", ordered: true }], topology: { childPolicy: "required", childSlots: [{ id: "packages", relationship: "child", targetTemplateIds: ["package.detail", "package.plugin", "package.integration"], min: 1, ordered: true }] } }),
  createDomainPageTemplate({ id: "package.detail", domain: "package", kind: "package", title: "Package detail", description: "Package detail page.", fallbackSchemaKinds: ["SoftwareSourceCode"], linkSlots: [{ id: "parent", relationship: "parent", role: "navigation", cardinality: "optional_one" }, { id: "children", relationship: "child", role: "tree_child", cardinality: "optional_many", ordered: true }, { id: "related", relationship: "related", role: "navigation", cardinality: "optional_many" }], topology: { childPolicy: "optional", childSlots: [{ id: "children", relationship: "child", targetTemplateIds: ["package.api", "package.version"], min: 0, ordered: true }] } }),
  createDomainPageTemplate({ id: "package.api", domain: "package", kind: "docs_bridge", title: "Package API", description: "Package API reference page.", fallbackSchemaKinds: ["TechArticle"], topology: { childPolicy: "terminal" } }),
  createDomainPageTemplate({ id: "package.plugin", domain: "package", kind: "package", title: "Plugin page", description: "Plugin package page.", fallbackSchemaKinds: ["SoftwareApplication"], topology: { childPolicy: "terminal" } }),
  createDomainPageTemplate({ id: "package.integration", domain: "package", kind: "package", title: "Integration page", description: "Integration package page.", fallbackSchemaKinds: ["SoftwareApplication"], topology: { childPolicy: "terminal" } }),
  createDomainPageTemplate({ id: "package.version", domain: "package", kind: "docs_bridge", title: "Package version", description: "Package version page.", fallbackSchemaKinds: ["SoftwareSourceCode"], topology: { childPolicy: "terminal" } }),
];

export const packageDomainBundle = defineTemplateBundle({
  id: "domain.package",
  domain: "package",
  title: "Package page templates",
  templates: packageTemplates,
});
