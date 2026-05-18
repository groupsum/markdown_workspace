import { defineTemplateBundle } from "../define.js";
import { createDomainPageTemplate } from "./shared.js";

export const supportTemplates = [
  createDomainPageTemplate({ id: "support.hub", domain: "support", kind: "docs_bridge", title: "Support hub", description: "Support landing and routing hub.", fallbackSchemaKinds: ["WebPage"], linkSlots: [{ id: "questions", relationship: "faq_question", cardinality: "optional_many", ordered: true }, { id: "articles", relationship: "child", cardinality: "optional_many", ordered: true }] }),
  createDomainPageTemplate({ id: "support.faq", domain: "support", kind: "answer", title: "FAQ page", description: "Frequently asked question page.", fallbackSchemaKinds: ["FAQPage"], linkSlots: [{ id: "parent", relationship: "parent", cardinality: "optional_one" }, { id: "related", relationship: "related", cardinality: "optional_many" }] }),
  createDomainPageTemplate({ id: "support.qa", domain: "support", kind: "answer", title: "Q&A page", description: "Question and answer detail page.", fallbackSchemaKinds: ["QAPage"] }),
  createDomainPageTemplate({ id: "support.contact", domain: "support", kind: "trust", title: "Contact support page", description: "Contact and support channel page.", fallbackSchemaKinds: ["WebPage"] }),
  createDomainPageTemplate({ id: "support.status", domain: "support", kind: "trust", title: "Status page", description: "Service status page.", fallbackSchemaKinds: ["WebPage"] }),
];

export const supportDomainBundle = defineTemplateBundle({
  id: "domain.support",
  domain: "support",
  title: "Support page templates",
  templates: supportTemplates,
});
