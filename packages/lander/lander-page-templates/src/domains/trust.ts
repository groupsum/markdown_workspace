import { defineTemplateBundle } from "../define.js";
import { createDomainPageTemplate } from "./shared.js";

export const trustTemplates = [
  createDomainPageTemplate({ id: "trust.hub", domain: "trust", kind: "trust", title: "Trust hub", description: "Trust and compliance hub page.", fallbackSchemaKinds: ["WebPage"], linkSlots: [{ id: "legal", relationship: "legal", role: "semantic", cardinality: "optional_many", ordered: true }, { id: "support", relationship: "support", role: "semantic", cardinality: "optional_many" }], topology: { childPolicy: "optional", childSlots: [{ id: "children", relationship: "child", targetTemplateIds: ["trust.privacy", "trust.terms", "trust.security", "trust.compliance", "trust.policy", "trust.legal", "trust.support"], min: 0, ordered: true }] } }),
  createDomainPageTemplate({ id: "trust.privacy", domain: "trust", kind: "trust", title: "Privacy policy", description: "Privacy policy page.", fallbackSchemaKinds: ["WebPage"], topology: { childPolicy: "terminal" } }),
  createDomainPageTemplate({ id: "trust.terms", domain: "trust", kind: "trust", title: "Terms of service", description: "Terms of service page.", fallbackSchemaKinds: ["WebPage"], topology: { childPolicy: "terminal" } }),
  createDomainPageTemplate({ id: "trust.security", domain: "trust", kind: "trust", title: "Security page", description: "Security posture page.", fallbackSchemaKinds: ["WebPage"], topology: { childPolicy: "terminal" } }),
  createDomainPageTemplate({ id: "trust.compliance", domain: "trust", kind: "trust", title: "Compliance page", description: "Compliance page.", fallbackSchemaKinds: ["WebPage"], topology: { childPolicy: "terminal" } }),
  createDomainPageTemplate({ id: "trust.policy", domain: "trust", kind: "trust", title: "Policy page", description: "Policy detail page.", fallbackSchemaKinds: ["WebPage"], topology: { childPolicy: "terminal" } }),
  createDomainPageTemplate({ id: "trust.legal", domain: "trust", kind: "trust", title: "Legal page", description: "Legal disclosure page.", fallbackSchemaKinds: ["WebPage"], topology: { childPolicy: "terminal" } }),
  createDomainPageTemplate({ id: "trust.support", domain: "trust", kind: "trust", title: "Trust support page", description: "Trust support and escalation page.", fallbackSchemaKinds: ["WebPage"], topology: { childPolicy: "terminal" } }),
];

export const trustDomainBundle = defineTemplateBundle({
  id: "domain.trust",
  domain: "trust",
  title: "Trust page templates",
  templates: trustTemplates,
});
