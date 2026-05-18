import { packageDomainBundle } from "@mdwrk/lander-page-templates";
import type { PageTemplatePreset, PresetOptions } from "../types.js";
import { buildPresetFromMaps, mergePresetLinks, mergePresetPages } from "../authoring.js";
import { presetSlug } from "../types.js";

export function createPackageCatalogPreset(options: PresetOptions = {}): PageTemplatePreset {
  return buildPresetFromMaps({
    id: "preset.package-catalog",
    title: "Package catalog preset",
    description: "Package catalog with detail and API pages.",
    domain: "package",
    bundles: [packageDomainBundle],
    pages: mergePresetPages({
      catalog: { id: "package:catalog", templateId: "package.catalog", slug: presetSlug(options.baseSlug, "packages"), title: options.title ?? "Packages", description: options.description ?? "Package catalog.", summary: "Browse packages and integrations." },
      detail: { id: "package:detail", templateId: "package.detail", slug: presetSlug(options.baseSlug, "packages/package-one"), title: "Package One", description: "Package detail.", summary: "Package details and installation.", order: 1 },
      api: { id: "package:api", templateId: "package.api", slug: presetSlug(options.baseSlug, "packages/package-one/api"), title: "Package API", description: "Package API.", summary: "Package API reference.", order: 1 },
      plugin: { id: "package:plugin", templateId: "package.plugin", slug: presetSlug(options.baseSlug, "packages/plugin-one"), title: "Plugin One", description: "Plugin package page.", summary: "Plugin details and activation.", order: 2 },
      integration: { id: "package:integration", templateId: "package.integration", slug: presetSlug(options.baseSlug, "packages/integration-one"), title: "Integration One", description: "Integration package page.", summary: "Integration details and setup.", order: 3 },
      version: { id: "package:version", templateId: "package.version", slug: presetSlug(options.baseSlug, "packages/package-one/versions/latest"), title: "Package Version", description: "Package version page.", summary: "Version compatibility and release facts.", order: 2 },
    }, options.pages),
    links: mergePresetLinks({
      catalog: { packages: ["detail", "plugin", "integration"] },
      detail: { children: ["api", "version"] },
    }, options.links),
  });
}
