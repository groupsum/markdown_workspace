import { defineTemplateBundle } from "../define.js";
import { createDomainPageTemplate } from "./shared.js";

export const productTemplates = [
  createDomainPageTemplate({ id: "product.home", domain: "product", kind: "home", title: "Product home", description: "Product home page.", fallbackSchemaKinds: ["WebPage", "SoftwareApplication"], linkSlots: [{ id: "children", relationship: "child", cardinality: "optional_many", ordered: true }, { id: "support", relationship: "support", cardinality: "optional_many" }, { id: "legal", relationship: "legal", cardinality: "optional_many" }] }),
  createDomainPageTemplate({ id: "product.feature", domain: "product", kind: "feature", title: "Feature page", description: "Product feature page.", fallbackSchemaKinds: ["WebPage", "SoftwareApplication"], linkSlots: [{ id: "parent", relationship: "parent", cardinality: "optional_one" }, { id: "related", relationship: "related", cardinality: "optional_many" }] }),
  createDomainPageTemplate({ id: "product.compare", domain: "product", kind: "compare", title: "Comparison page", description: "Product comparison page.", fallbackSchemaKinds: ["WebPage", "Product"] }),
  createDomainPageTemplate({ id: "product.pricing", domain: "product", kind: "pricing", title: "Pricing page", description: "Product pricing page.", fallbackSchemaKinds: ["WebPage", "Product"] }),
  createDomainPageTemplate({ id: "product.case-study", domain: "product", kind: "proof", title: "Case study page", description: "Product case-study page.", fallbackSchemaKinds: ["Article"] }),
];

export const productDomainBundle = defineTemplateBundle({
  id: "domain.product",
  domain: "product",
  title: "Product page templates",
  templates: productTemplates,
});
