import { supportDomainBundle } from "@mdwrk/lander-page-templates";
import type { PageTemplatePreset, PresetOptions } from "../types.js";
import { edge, presetSlug, seedInstance } from "../types.js";

export function createFaqHubPreset(options: PresetOptions = {}): PageTemplatePreset {
  const title = options.title ?? "Support";
  const instances = [
    seedInstance({ id: "support:hub", templateId: "support.hub", slug: presetSlug(options.baseSlug, "support"), title, description: options.description ?? "FAQ and support hub.", summary: "Find common answers and support articles." }),
    seedInstance({ id: "support:question-1", templateId: "support.qa", slug: presetSlug(options.baseSlug, "support/question-1"), title: "Question One", description: "Question and answer detail.", summary: "Answer the first common question.", order: 1 }),
    seedInstance({ id: "support:question-2", templateId: "support.qa", slug: presetSlug(options.baseSlug, "support/question-2"), title: "Question Two", description: "Question and answer detail.", summary: "Answer the second common question.", order: 2 }),
  ];
  return {
    id: "preset.faq-hub",
    title: "FAQ hub preset",
    description: "FAQ hub with ordered Q&A detail pages.",
    domain: "support",
    bundles: [supportDomainBundle],
    graph: {
      templates: supportDomainBundle.templates,
      bundles: [supportDomainBundle],
      instances,
      edges: [
        edge("support:hub", "support:question-1", "faq_question", "questions", 1),
        edge("support:hub", "support:question-2", "faq_question", "questions", 2),
      ],
    },
  };
}
