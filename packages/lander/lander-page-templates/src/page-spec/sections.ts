import type { DomainTemplateData } from "../types.js";
import type { SectionSpec } from "@mdwrk/lander-content-contract";

export function defaultSections(data: DomainTemplateData, title: string, fallbackBody: string): SectionSpec[] {
  if (data.sections?.length) return data.sections;
  return [
    {
      id: "hero",
      kind: "hero",
      eyebrow: data.eyebrow,
      title,
      subtitle: data.summary ?? fallbackBody,
    },
    {
      id: "overview",
      kind: "markdown",
      title: "Overview",
      body: data.body ?? data.summary ?? fallbackBody,
    },
  ];
}
