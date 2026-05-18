import { docsDomainBundle } from "@mdwrk/lander-page-templates";
import type { PageTemplatePreset, PresetOptions } from "../types.js";
import { edge, presetSlug, seedInstance } from "../types.js";

export function createDocsHubPreset(options: PresetOptions = {}): PageTemplatePreset {
  const instances = [
    seedInstance({ id: "docs:hub", templateId: "docs.hub", slug: presetSlug(options.baseSlug, "docs"), title: options.title ?? "Docs", description: options.description ?? "Documentation hub.", summary: "Browse guides, tutorials, and references." }),
    seedInstance({ id: "docs:guide", templateId: "docs.guide", slug: presetSlug(options.baseSlug, "docs/guide"), title: "Guide", description: "Guide page.", summary: "Follow a guide.", order: 1 }),
    seedInstance({ id: "docs:tutorial", templateId: "docs.tutorial", slug: presetSlug(options.baseSlug, "docs/tutorial"), title: "Tutorial", description: "Tutorial page.", summary: "Complete a tutorial.", order: 2 }),
  ];
  return {
    id: "preset.docs-hub",
    title: "Docs hub preset",
    description: "Documentation hub with ordered guide and tutorial pages.",
    domain: "docs",
    bundles: [docsDomainBundle],
    graph: {
      templates: docsDomainBundle.templates,
      bundles: [docsDomainBundle],
      instances,
      edges: [
        edge("docs:hub", "docs:guide", "child", "children", 1),
        edge("docs:hub", "docs:tutorial", "child", "children", 2),
        edge("docs:guide", "docs:tutorial", "next", "next", 1),
      ],
    },
  };
}
