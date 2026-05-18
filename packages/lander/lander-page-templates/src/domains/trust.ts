import { defineTemplateBundle } from "../define.js";
import { createDomainPageTemplate } from "./shared.js";

export const trustTemplates = [
  createDomainPageTemplate({ id: "trust.hub", domain: "trust", kind: "trust", title: "Trust hub", description: "Trust and compliance hub page.", fallbackSchemaKinds: ["WebPage"], linkSlots: [{ id: "legal", relationship: "legal", cardinality: "optional_many", ordered: true }, { id: "support", relationship: "support", cardinality: "optional_many" }] }),
  createDomainPageTemplate({ id: "trust.privacy", domain: "trust", kind: "trust", title: "Privacy policy", description: "Privacy policy page.", fallbackSchemaKinds: ["WebPage"] }),
  createDomainPageTemplate({ id: "trust.terms", domain: "trust", kind: "trust", title: "Terms of service", description: "Terms of service page.", fallbackSchemaKinds: ["WebPage"] }),
  createDomainPageTemplate({ id: "trust.security", domain: "trust", kind: "trust", title: "Security page", description: "Security posture page.", fallbackSchemaKinds: ["WebPage"] }),
  createDomainPageTemplate({ id: "trust.compliance", domain: "trust", kind: "trust", title: "Compliance page", description: "Compliance page.", fallbackSchemaKinds: ["WebPage"] }),
];

export const trustDomainBundle = defineTemplateBundle({
  id: "domain.trust",
  domain: "trust",
  title: "Trust page templates",
  templates: trustTemplates,
});
