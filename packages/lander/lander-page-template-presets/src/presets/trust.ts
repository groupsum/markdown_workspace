import { trustDomainBundle } from "@mdwrk/lander-page-templates";
import type { PageTemplatePreset, PresetOptions } from "../types.js";
import { buildPresetFromMaps, mergePresetLinks, mergePresetPages } from "../authoring.js";
import { presetSlug } from "../types.js";

export function createTrustCenterPreset(options: PresetOptions = {}): PageTemplatePreset {
  return buildPresetFromMaps({
    id: "preset.trust-center",
    title: "Trust center preset",
    description: "Trust hub with legal and security pages.",
    domain: "trust",
    bundles: [trustDomainBundle],
    pages: mergePresetPages({
      hub: { id: "trust:hub", templateId: "trust.hub", slug: presetSlug(options.baseSlug, "trust"), title: options.title ?? "Trust Center", description: options.description ?? "Trust and policy hub.", summary: "Review trust, privacy, security, and terms." },
      privacy: { id: "trust:privacy", templateId: "trust.privacy", slug: presetSlug(options.baseSlug, "privacy"), title: "Privacy", description: "Privacy policy.", summary: "Privacy commitments.", order: 1 },
      terms: { id: "trust:terms", templateId: "trust.terms", slug: presetSlug(options.baseSlug, "terms"), title: "Terms", description: "Terms of service.", summary: "Terms of service.", order: 2 },
      security: { id: "trust:security", templateId: "trust.security", slug: presetSlug(options.baseSlug, "security"), title: "Security", description: "Security page.", summary: "Security posture.", order: 3 },
      compliance: { id: "trust:compliance", templateId: "trust.compliance", slug: presetSlug(options.baseSlug, "compliance"), title: "Compliance", description: "Compliance page.", summary: "Compliance posture.", order: 4 },
      policy: { id: "trust:policy", templateId: "trust.policy", slug: presetSlug(options.baseSlug, "policy"), title: "Policy", description: "Policy page.", summary: "Operational policy.", order: 5 },
      legal: { id: "trust:legal", templateId: "trust.legal", slug: presetSlug(options.baseSlug, "legal"), title: "Legal", description: "Legal page.", summary: "Legal disclosures.", order: 6 },
      support: { id: "trust:support", templateId: "trust.support", slug: presetSlug(options.baseSlug, "trust/support"), title: "Trust Support", description: "Trust support page.", summary: "Escalate trust and policy questions.", order: 7 },
    }, options.pages),
    links: mergePresetLinks({
      hub: { legal: ["privacy", "terms", "security", "compliance", "policy", "legal"], support: ["support"] },
    }, options.links),
  });
}
