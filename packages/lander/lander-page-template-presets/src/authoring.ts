import type { PageTemplatePreset, BuildPresetGraphInput, PresetLinkTarget, PresetLinkValue, PresetOptions, PresetPageContent, PresetPageSeed } from "./types.js";
import { edge, seedInstance } from "./types.js";

function mergePageSeed(defaultSeed: PresetPageSeed, override?: PresetPageContent): PresetPageSeed {
  if (!override) return defaultSeed;
  const data = {
    ...(defaultSeed.data ?? { summary: defaultSeed.summary }),
    ...(override.data ?? {}),
  };
  return {
    ...defaultSeed,
    ...override,
    id: override.id ?? defaultSeed.id,
    templateId: override.templateId ?? defaultSeed.templateId,
    slug: override.slug ?? defaultSeed.slug,
    title: override.title ?? defaultSeed.title,
    description: override.description ?? defaultSeed.description,
    summary: override.summary ?? defaultSeed.summary,
    data,
  };
}

function linkTarget(value: PresetLinkValue, index: number): PresetLinkTarget {
  if (typeof value === "string") {
    return { page: value, order: index + 1 };
  }
  return { ...value, order: value.order ?? index + 1 };
}

export function mergePresetPages(defaultPages: Record<string, PresetPageSeed>, overrides: PresetOptions["pages"] = {}): Record<string, PresetPageSeed> {
  const merged: Record<string, PresetPageSeed> = {};
  for (const [key, seed] of Object.entries(defaultPages)) {
    merged[key] = mergePageSeed(seed, overrides[key]);
  }
  for (const [key, override] of Object.entries(overrides)) {
    if (merged[key]) continue;
    if (!override.id || !override.templateId || !override.slug || !override.title || !override.description) {
      throw new Error(`Preset page ${key} must provide id, templateId, slug, title, and description when it is not overriding a default page.`);
    }
    merged[key] = {
      id: override.id,
      templateId: override.templateId,
      slug: override.slug,
      title: override.title,
      description: override.description,
      summary: override.summary,
      order: override.order,
      data: override.data ?? { summary: override.summary },
    };
  }
  return merged;
}

export function mergePresetLinks(defaultLinks: BuildPresetGraphInput["links"] = {}, overrides: PresetOptions["links"] = {}): BuildPresetGraphInput["links"] {
  const merged: BuildPresetGraphInput["links"] = {};
  for (const [source, slots] of Object.entries(defaultLinks)) {
    merged[source] = { ...slots };
  }
  for (const [source, slots] of Object.entries(overrides)) {
    merged[source] = { ...(merged[source] ?? {}), ...slots };
  }
  return merged;
}

export function buildPresetGraphFromMaps(input: BuildPresetGraphInput) {
  const templates = input.bundles.flatMap((bundle) => bundle.templates);
  const templateById = new Map(templates.map((template) => [template.id, template]));
  const instances = Object.values(input.pages).map(seedInstance);
  const instanceIdsByPageKey = new Map(Object.entries(input.pages).map(([key, seed]) => [key, seed.id]));
  const pageByKey = new Map(Object.entries(input.pages));
  const edges = [];

  for (const [sourceKey, slots] of Object.entries(input.links ?? {})) {
    const sourceSeed = pageByKey.get(sourceKey);
    if (!sourceSeed) throw new Error(`Preset link source ${sourceKey} is not a known page.`);
    const sourceTemplate = templateById.get(sourceSeed.templateId);
    for (const [slotId, values] of Object.entries(slots)) {
      const slot = sourceTemplate?.linkSlots?.find((item) => item.id === slotId);
      for (const [index, value] of values.entries()) {
        const target = linkTarget(value, index);
        const targetId = instanceIdsByPageKey.get(target.page);
        if (!targetId) throw new Error(`Preset link target ${target.page} is not a known page.`);
        edges.push(edge(
          sourceSeed.id,
          targetId,
          target.relationship ?? slot?.relationship ?? slotId,
          slotId,
          target.order,
          target.role ?? slot?.role,
          target.label,
        ));
      }
    }
  }

  return {
    templates,
    bundles: input.bundles,
    instances,
    edges,
  };
}

export function buildPresetFromMaps(input: Omit<PageTemplatePreset, "graph"> & BuildPresetGraphInput): PageTemplatePreset {
  return {
    id: input.id,
    title: input.title,
    description: input.description,
    domain: input.domain,
    bundles: input.bundles,
    graph: buildPresetGraphFromMaps(input),
  };
}
