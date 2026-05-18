import type { TemplateGraph, TemplateBundle, PageInstance, TemplateEdge } from "@mdwrk/lander-page-templates";

export interface PageTemplatePreset {
  id: string;
  title: string;
  description: string;
  domain: string;
  graph: TemplateGraph;
  bundles: TemplateBundle[];
}

export interface PresetOptions {
  baseSlug?: string;
  title?: string;
  description?: string;
}

export interface PresetPageSeed {
  id: string;
  templateId: string;
  slug: string;
  title: string;
  description: string;
  summary: string;
  order?: number;
}

export function normalizePresetBaseSlug(value = "/"): string {
  const trimmed = value.trim();
  if (!trimmed || trimmed === "/") return "";
  return `/${trimmed.replace(/^\/+|\/+$/g, "")}`;
}

export function presetSlug(baseSlug: string | undefined, suffix = ""): string {
  const base = normalizePresetBaseSlug(baseSlug);
  const cleanSuffix = suffix.replace(/^\/+|\/+$/g, "");
  if (!base && !cleanSuffix) return "/";
  if (!cleanSuffix) return `${base}/`;
  return `${base}/${cleanSuffix}/`.replace(/\/+/g, "/");
}

export function seedInstance(seed: PresetPageSeed): PageInstance {
  return {
    id: seed.id,
    templateId: seed.templateId,
    slug: seed.slug,
    title: seed.title,
    description: seed.description,
    order: seed.order,
    data: {
      summary: seed.summary,
    },
  };
}

export function edge(sourceId: string, targetId: string, relationship: string, slotId: string, order?: number): TemplateEdge {
  return { sourceId, targetId, relationship, slotId, order };
}
