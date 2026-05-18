import { trustDomainBundle } from "@mdwrk/lander-page-templates";
import type { PageTemplatePreset, PresetOptions } from "../types.js";
import { edge, presetSlug, seedInstance } from "../types.js";

export function createTrustCenterPreset(options: PresetOptions = {}): PageTemplatePreset {
  const instances = [
    seedInstance({ id: "trust:hub", templateId: "trust.hub", slug: presetSlug(options.baseSlug, "trust"), title: options.title ?? "Trust Center", description: options.description ?? "Trust and policy hub.", summary: "Review trust, privacy, security, and terms." }),
    seedInstance({ id: "trust:privacy", templateId: "trust.privacy", slug: presetSlug(options.baseSlug, "privacy"), title: "Privacy", description: "Privacy policy.", summary: "Privacy commitments.", order: 1 }),
    seedInstance({ id: "trust:terms", templateId: "trust.terms", slug: presetSlug(options.baseSlug, "terms"), title: "Terms", description: "Terms of service.", summary: "Terms of service.", order: 2 }),
    seedInstance({ id: "trust:security", templateId: "trust.security", slug: presetSlug(options.baseSlug, "security"), title: "Security", description: "Security page.", summary: "Security posture.", order: 3 }),
  ];
  return {
    id: "preset.trust-center",
    title: "Trust center preset",
    description: "Trust hub with legal and security pages.",
    domain: "trust",
    bundles: [trustDomainBundle],
    graph: {
      templates: trustDomainBundle.templates,
      bundles: [trustDomainBundle],
      instances,
      edges: [
        edge("trust:hub", "trust:privacy", "legal", "legal", 1),
        edge("trust:hub", "trust:terms", "legal", "legal", 2),
        edge("trust:hub", "trust:security", "legal", "legal", 3),
      ],
    },
  };
}
