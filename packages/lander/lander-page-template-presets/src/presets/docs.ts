import { docsDomainBundle } from "@mdwrk/lander-page-templates";
import type { PageTemplatePreset, PresetOptions } from "../types.js";
import { buildPresetFromMaps, mergePresetLinks, mergePresetPages } from "../authoring.js";
import { presetSlug } from "../types.js";

export function createDocsHubPreset(options: PresetOptions = {}): PageTemplatePreset {
  return buildPresetFromMaps({
    id: "preset.docs-hub",
    title: "Docs hub preset",
    description: "Documentation hub with ordered guide and tutorial pages.",
    domain: "docs",
    bundles: [docsDomainBundle],
    pages: mergePresetPages({
      hub: { id: "docs:hub", templateId: "docs.hub", slug: presetSlug(options.baseSlug, "docs"), title: options.title ?? "Docs", description: options.description ?? "Documentation hub.", summary: "Browse guides, tutorials, and references." },
      guide: { id: "docs:guide", templateId: "docs.guide", slug: presetSlug(options.baseSlug, "docs/guide"), title: "Guide", description: "Guide page.", summary: "Follow a guide.", order: 1 },
      reference: { id: "docs:reference", templateId: "docs.reference", slug: presetSlug(options.baseSlug, "docs/reference"), title: "Reference", description: "Reference page.", summary: "Look up reference material.", order: 2 },
      api: { id: "docs:api", templateId: "docs.api", slug: presetSlug(options.baseSlug, "docs/api"), title: "API", description: "API documentation page.", summary: "Read the API contract.", order: 3 },
      tutorial: { id: "docs:tutorial", templateId: "docs.tutorial", slug: presetSlug(options.baseSlug, "docs/tutorial"), title: "Tutorial", description: "Tutorial page.", summary: "Complete a tutorial.", order: 4 },
      troubleshooting: { id: "docs:troubleshooting", templateId: "docs.troubleshooting", slug: presetSlug(options.baseSlug, "docs/troubleshooting"), title: "Troubleshooting", description: "Troubleshooting page.", summary: "Resolve known problems.", order: 5 },
      releaseNote: { id: "docs:release-note", templateId: "docs.release-note", slug: presetSlug(options.baseSlug, "docs/releases/latest"), title: "Release Note", description: "Release note page.", summary: "Review recent changes.", order: 6 },
    }, options.pages),
    links: mergePresetLinks({
      hub: { children: ["guide", "reference", "api", "tutorial", "troubleshooting", "releaseNote"] },
      guide: { next: ["reference"] },
      reference: { next: ["api"] },
      api: { next: ["tutorial"] },
    }, options.links),
  });
}
