import { definePageInstance, defineTemplateGraph } from "../define.js";
import { buildPageSpecsFromGraph } from "../page-spec/build-page-spec.js";
import { productDomainBundle } from "../domains/product.js";

export const genericTemplateGraph = defineTemplateGraph({
  templates: productDomainBundle.templates,
  bundles: [productDomainBundle],
  instances: [
    definePageInstance({
      id: "home",
      templateId: "product.home",
      slug: "/",
      title: "Example Product",
      description: "Example product landing page.",
      data: { summary: "A portable product page authored from a reusable template." },
    }),
  ],
  edges: [],
});

export const genericTemplatePages = buildPageSpecsFromGraph(genericTemplateGraph).pages;
