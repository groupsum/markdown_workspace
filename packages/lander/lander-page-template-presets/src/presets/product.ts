import { productDomainBundle, supportDomainBundle, trustDomainBundle } from "@mdwrk/lander-page-templates";
import type { PageTemplatePreset, PresetOptions } from "../types.js";
import { edge, presetSlug, seedInstance } from "../types.js";

export function createProductSitePreset(options: PresetOptions = {}): PageTemplatePreset {
  const title = options.title ?? "Product";
  const description = options.description ?? "A product lander page system.";
  const instances = [
    seedInstance({ id: "product:home", templateId: "product.home", slug: presetSlug(options.baseSlug), title, description, summary: "Introduce the product, core offer, and primary paths." }),
    seedInstance({ id: "product:feature", templateId: "product.feature", slug: presetSlug(options.baseSlug, "features/core"), title: "Core Feature", description: "A reusable feature detail page.", summary: "Explain a core product feature." }),
    seedInstance({ id: "support:hub", templateId: "support.hub", slug: presetSlug(options.baseSlug, "support"), title: "Support", description: "Support hub.", summary: "Route visitors to support answers." }),
    seedInstance({ id: "trust:privacy", templateId: "trust.privacy", slug: presetSlug(options.baseSlug, "privacy"), title: "Privacy", description: "Privacy policy.", summary: "State privacy commitments." }),
    seedInstance({ id: "trust:terms", templateId: "trust.terms", slug: presetSlug(options.baseSlug, "terms"), title: "Terms", description: "Terms of service.", summary: "State terms of service." }),
  ];
  return {
    id: "preset.product-site",
    title: "Product site preset",
    description,
    domain: "product",
    bundles: [productDomainBundle, supportDomainBundle, trustDomainBundle],
    graph: {
      templates: [...productDomainBundle.templates, ...supportDomainBundle.templates, ...trustDomainBundle.templates],
      bundles: [productDomainBundle, supportDomainBundle, trustDomainBundle],
      instances,
      edges: [
        edge("product:home", "product:feature", "child", "children", 1),
        edge("product:home", "support:hub", "support", "support", 1),
        edge("product:home", "trust:privacy", "legal", "legal", 1),
        edge("product:home", "trust:terms", "legal", "legal", 2),
      ],
    },
  };
}
