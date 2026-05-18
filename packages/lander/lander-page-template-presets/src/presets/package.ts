import { packageDomainBundle } from "@mdwrk/lander-page-templates";
import type { PageTemplatePreset, PresetOptions } from "../types.js";
import { edge, presetSlug, seedInstance } from "../types.js";

export function createPackageCatalogPreset(options: PresetOptions = {}): PageTemplatePreset {
  const instances = [
    seedInstance({ id: "package:catalog", templateId: "package.catalog", slug: presetSlug(options.baseSlug, "packages"), title: options.title ?? "Packages", description: options.description ?? "Package catalog.", summary: "Browse packages and integrations." }),
    seedInstance({ id: "package:detail", templateId: "package.detail", slug: presetSlug(options.baseSlug, "packages/package-one"), title: "Package One", description: "Package detail.", summary: "Package details and installation.", order: 1 }),
    seedInstance({ id: "package:api", templateId: "package.api", slug: presetSlug(options.baseSlug, "packages/package-one/api"), title: "Package API", description: "Package API.", summary: "Package API reference.", order: 1 }),
  ];
  return {
    id: "preset.package-catalog",
    title: "Package catalog preset",
    description: "Package catalog with detail and API pages.",
    domain: "package",
    bundles: [packageDomainBundle],
    graph: {
      templates: packageDomainBundle.templates,
      bundles: [packageDomainBundle],
      instances,
      edges: [
        edge("package:catalog", "package:detail", "child", "packages", 1),
        edge("package:detail", "package:api", "related", "related", 1),
      ],
    },
  };
}
