import { supportDomainBundle } from "@mdwrk/lander-page-templates";
import type { PageTemplatePreset, PresetOptions } from "../types.js";
import { buildPresetFromMaps, mergePresetLinks, mergePresetPages } from "../authoring.js";
import { presetSlug } from "../types.js";

export function createFaqHubPreset(options: PresetOptions = {}): PageTemplatePreset {
  const title = options.title ?? "Support";
  return buildPresetFromMaps({
    id: "preset.faq-hub",
    title: "FAQ hub preset",
    description: "FAQ hub with ordered Q&A detail pages.",
    domain: "support",
    bundles: [supportDomainBundle],
    pages: mergePresetPages({
      hub: { id: "support:hub", templateId: "support.hub", slug: presetSlug(options.baseSlug, "support"), title, description: options.description ?? "FAQ and support hub.", summary: "Find common answers and support articles." },
      question1: { id: "support:question-1", templateId: "support.qa", slug: presetSlug(options.baseSlug, "support/question-1"), title: "Question One", description: "Question and answer detail.", summary: "Answer the first common question.", order: 1 },
      question2: { id: "support:question-2", templateId: "support.qa", slug: presetSlug(options.baseSlug, "support/question-2"), title: "Question Two", description: "Question and answer detail.", summary: "Answer the second common question.", order: 2 },
      article: { id: "support:article", templateId: "support.article", slug: presetSlug(options.baseSlug, "support/article"), title: "Support Article", description: "Support article page.", summary: "Explain a repeatable support workflow.", order: 3 },
      contact: { id: "support:contact", templateId: "support.contact", slug: presetSlug(options.baseSlug, "support/contact"), title: "Contact Support", description: "Contact support page.", summary: "Route users to support channels.", order: 4 },
      status: { id: "support:status", templateId: "support.status", slug: presetSlug(options.baseSlug, "support/status"), title: "Status", description: "Status page.", summary: "Show service status.", order: 5 },
      ticket: { id: "support:ticket", templateId: "support.ticket-intent", slug: presetSlug(options.baseSlug, "support/ticket"), title: "Open a Ticket", description: "Ticket routing page.", summary: "Capture support ticket intent.", order: 6 },
    }, options.pages),
    links: mergePresetLinks({
      hub: { questions: ["question1", "question2"], articles: ["article"], support: ["contact", "status", "ticket"] },
    }, options.links),
  });
}
