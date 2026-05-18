import { defineEdge, definePageInstance, defineTemplateGraph } from "../define.js";
import { productDomainBundle } from "../domains/product.js";

export const productTemplateGraph = defineTemplateGraph({
  templates: productDomainBundle.templates,
  bundles: [productDomainBundle],
  instances: [
    definePageInstance({ id: "home", templateId: "product.home", slug: "/", title: "Product", description: "Product home.", data: { summary: "Product overview." } }),
    definePageInstance({ id: "feature", templateId: "product.feature", slug: "/features/one/", title: "Feature", description: "Feature page.", data: { summary: "Feature overview." } }),
  ],
  edges: [
    defineEdge({ sourceId: "home", targetId: "feature", relationship: "child", slotId: "children", order: 1 }),
  ],
});
