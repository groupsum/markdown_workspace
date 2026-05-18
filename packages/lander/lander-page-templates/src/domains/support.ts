import { defineTemplateBundle } from "../define.js";
import { createDomainPageTemplate } from "./shared.js";

export const supportTemplates = [
  createDomainPageTemplate({ id: "support.hub", domain: "support", kind: "docs_bridge", title: "Support hub", description: "Support landing and routing hub.", fallbackSchemaKinds: ["WebPage"], linkSlots: [{ id: "questions", relationship: "faq_question", role: "tree_child", cardinality: "optional_many", ordered: true }, { id: "articles", relationship: "child", role: "tree_child", cardinality: "optional_many", ordered: true }, { id: "support", relationship: "support", role: "semantic", cardinality: "optional_many", ordered: true }], topology: { childPolicy: "optional", childSlots: [{ id: "questions", relationship: "faq_question", targetTemplateIds: ["support.qa", "support.faq"], min: 0, ordered: true }, { id: "articles", relationship: "child", targetTemplateIds: ["support.faq", "support.article"], min: 0, ordered: true }] } }),
  createDomainPageTemplate({ id: "support.faq", domain: "support", kind: "answer", title: "FAQ page", description: "Frequently asked question page.", fallbackSchemaKinds: ["FAQPage"], linkSlots: [{ id: "parent", relationship: "parent", role: "navigation", cardinality: "optional_one" }, { id: "related", relationship: "related", role: "navigation", cardinality: "optional_many" }], topology: { childPolicy: "terminal" } }),
  createDomainPageTemplate({ id: "support.qa", domain: "support", kind: "answer", title: "Q&A page", description: "Question and answer detail page.", fallbackSchemaKinds: ["QAPage"], topology: { childPolicy: "terminal" } }),
  createDomainPageTemplate({ id: "support.article", domain: "support", kind: "docs_bridge", title: "Support article", description: "Support article page.", fallbackSchemaKinds: ["TechArticle"], topology: { childPolicy: "terminal" } }),
  createDomainPageTemplate({ id: "support.contact", domain: "support", kind: "trust", title: "Contact support page", description: "Contact and support channel page.", fallbackSchemaKinds: ["WebPage"], topology: { childPolicy: "terminal" } }),
  createDomainPageTemplate({ id: "support.status", domain: "support", kind: "trust", title: "Status page", description: "Service status page.", fallbackSchemaKinds: ["WebPage"], topology: { childPolicy: "terminal" } }),
  createDomainPageTemplate({ id: "support.ticket-intent", domain: "support", kind: "answer", title: "Ticket intent page", description: "Support ticket intent and routing page.", fallbackSchemaKinds: ["WebPage"], topology: { childPolicy: "terminal" } }),
];

export const supportDomainBundle = defineTemplateBundle({
  id: "domain.support",
  domain: "support",
  title: "Support page templates",
  templates: supportTemplates,
});
