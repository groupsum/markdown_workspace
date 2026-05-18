import { productDomainBundle, supportDomainBundle, trustDomainBundle } from "@mdwrk/lander-page-templates";
import type { PageTemplatePreset, PresetOptions } from "../types.js";
import { mergePresetLinks, mergePresetPages, buildPresetFromMaps } from "../authoring.js";
import { presetSlug } from "../types.js";

export function createProductSitePreset(options: PresetOptions = {}): PageTemplatePreset {
  const title = options.title ?? "Product";
  const description = options.description ?? "A product lander page system.";
  return buildPresetFromMaps({
    id: "preset.product-site",
    title: "Product site preset",
    description,
    domain: "product",
    bundles: [productDomainBundle, supportDomainBundle, trustDomainBundle],
    pages: mergePresetPages({
      home: { id: "product:home", templateId: "product.home", slug: presetSlug(options.baseSlug), title, description, summary: "Introduce the product, core offer, and primary paths." },
      product: { id: "product:detail", templateId: "product.product", slug: presetSlug(options.baseSlug, "product"), title: `${title} Overview`, description: "Product detail page.", summary: "Explain the product, positioning, and buyer context.", order: 1 },
      feature: { id: "product:feature", templateId: "product.feature", slug: presetSlug(options.baseSlug, "features/core"), title: "Core Feature", description: "A reusable feature detail page.", summary: "Explain a core product feature." },
      compare: { id: "product:compare", templateId: "product.compare", slug: presetSlug(options.baseSlug, "compare"), title: "Compare", description: "Product comparison page.", summary: "Compare the product against alternatives.", order: 2 },
      pricing: { id: "product:pricing", templateId: "product.pricing", slug: presetSlug(options.baseSlug, "pricing"), title: "Pricing", description: "Pricing page.", summary: "Explain plan packaging and buying options.", order: 3 },
      caseStudy: { id: "product:case-study", templateId: "product.case-study", slug: presetSlug(options.baseSlug, "customers/story"), title: "Customer Story", description: "Case study page.", summary: "Show a customer outcome.", order: 4 },
      changelog: { id: "product:changelog", templateId: "product.changelog", slug: presetSlug(options.baseSlug, "changelog"), title: "Changelog", description: "Product changelog.", summary: "Track product updates.", order: 5 },
      support: { id: "support:hub", templateId: "support.hub", slug: presetSlug(options.baseSlug, "support"), title: "Support", description: "Support hub.", summary: "Route visitors to support answers." },
      privacy: { id: "trust:privacy", templateId: "trust.privacy", slug: presetSlug(options.baseSlug, "privacy"), title: "Privacy", description: "Privacy policy.", summary: "State privacy commitments." },
      terms: { id: "trust:terms", templateId: "trust.terms", slug: presetSlug(options.baseSlug, "terms"), title: "Terms", description: "Terms of service.", summary: "State terms of service." },
    }, options.pages),
    links: mergePresetLinks({
      home: {
        children: ["product", "feature", "compare", "pricing", "caseStudy", "changelog"],
        support: ["support"],
        legal: ["privacy", "terms"],
      },
      product: {
        children: ["feature", "compare", "pricing", "caseStudy", "changelog"],
      },
    }, options.links),
  });
}
