import { defineTemplateBundle } from "../define.js";
import { createDomainPageTemplate } from "./shared.js";

export const productTemplates = [
  createDomainPageTemplate({ id: "product.home", domain: "product", kind: "home", title: "Product home", description: "Product home page.", fallbackSchemaKinds: ["WebPage", "SoftwareApplication"], linkSlots: [{ id: "children", relationship: "child", role: "tree_child", cardinality: "optional_many", ordered: true }, { id: "support", relationship: "support", role: "semantic", cardinality: "optional_many" }, { id: "legal", relationship: "legal", role: "semantic", cardinality: "optional_many" }], topology: { childPolicy: "optional", childSlots: [{ id: "children", relationship: "child", targetTemplateIds: ["product.product", "product.feature", "product.compare", "product.pricing", "product.case-study", "product.changelog"], min: 0, ordered: true }] } }),
  createDomainPageTemplate({ id: "product.product", domain: "product", kind: "package", title: "Product detail", description: "Product detail page.", fallbackSchemaKinds: ["Product", "SoftwareApplication"], linkSlots: [{ id: "parent", relationship: "parent", role: "navigation", cardinality: "optional_one" }, { id: "children", relationship: "child", role: "tree_child", cardinality: "optional_many", ordered: true }, { id: "related", relationship: "related", role: "navigation", cardinality: "optional_many" }], topology: { childPolicy: "optional", childSlots: [{ id: "children", relationship: "child", targetTemplateIds: ["product.feature", "product.compare", "product.pricing", "product.case-study", "product.changelog"], min: 0, ordered: true }] } }),
  createDomainPageTemplate({ id: "product.feature", domain: "product", kind: "feature", title: "Feature page", description: "Product feature page.", fallbackSchemaKinds: ["WebPage", "SoftwareApplication"], linkSlots: [{ id: "parent", relationship: "parent", role: "navigation", cardinality: "optional_one" }, { id: "related", relationship: "related", role: "navigation", cardinality: "optional_many" }], topology: { childPolicy: "optional", childSlots: [{ id: "children", relationship: "child", min: 0, ordered: true }] } }),
  createDomainPageTemplate({ id: "product.compare", domain: "product", kind: "compare", title: "Comparison page", description: "Product comparison page.", fallbackSchemaKinds: ["WebPage", "Product"], topology: { childPolicy: "terminal" } }),
  createDomainPageTemplate({ id: "product.pricing", domain: "product", kind: "pricing", title: "Pricing page", description: "Product pricing page.", fallbackSchemaKinds: ["WebPage", "Product"], topology: { childPolicy: "terminal" } }),
  createDomainPageTemplate({ id: "product.case-study", domain: "product", kind: "proof", title: "Case study page", description: "Product case-study page.", fallbackSchemaKinds: ["Article"], topology: { childPolicy: "terminal" } }),
  createDomainPageTemplate({ id: "product.changelog", domain: "product", kind: "docs_bridge", title: "Changelog page", description: "Product changelog page.", fallbackSchemaKinds: ["Article"], topology: { childPolicy: "terminal" } }),
];

export const productDomainBundle = defineTemplateBundle({
  id: "domain.product",
  domain: "product",
  title: "Product page templates",
  templates: productTemplates,
});
