import { defineEdge, definePageInstance, defineTemplateGraph } from "../define.js";
import { supportDomainBundle } from "../domains/support.js";

export const supportTemplateGraph = defineTemplateGraph({
  templates: supportDomainBundle.templates,
  bundles: [supportDomainBundle],
  instances: [
    definePageInstance({ id: "faq-hub", templateId: "support.hub", slug: "/support/", title: "Support", description: "Support hub.", data: { summary: "Find answers and support channels." } }),
    definePageInstance({ id: "qa", templateId: "support.qa", slug: "/support/question/", title: "Question", description: "Question answer.", data: { summary: "A direct answer." } }),
  ],
  edges: [
    defineEdge({ sourceId: "faq-hub", targetId: "qa", relationship: "faq_question", slotId: "questions", order: 1 }),
  ],
});
