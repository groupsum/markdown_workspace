import type { PageInstance, ResolvedLinkSlots, ResolvedTemplateLink, TemplateGraph } from "../types.js";

function hrefFor(instance: PageInstance): string {
  return instance.href ?? instance.slug;
}

function labelFor(instance: PageInstance): string {
  return instance.label ?? instance.title;
}

export function resolveLinkSlots(graph: TemplateGraph, sourceId: string): ResolvedLinkSlots {
  const instances = new Map(graph.instances.map((instance) => [instance.id, instance]));
  const templates = new Map(graph.templates.map((template) => [template.id, template]));
  const source = instances.get(sourceId);
  if (!source) return {};

  const sourceTemplate = templates.get(source.templateId);
  const slots: ResolvedLinkSlots = {};

  for (const edge of graph.edges.filter((item) => item.sourceId === sourceId)) {
    const target = instances.get(edge.targetId);
    if (!target) continue;
    const slot = sourceTemplate?.linkSlots?.find((item) => item.id === edge.slotId || item.relationship === edge.relationship);
    const slotId = edge.slotId ?? slot?.id ?? edge.relationship;
    const order = edge.order ?? target.order ?? 0;
    const resolved: ResolvedTemplateLink = {
      id: edge.id ?? `${edge.sourceId}:${edge.relationship}:${edge.targetId}`,
      sourceId: edge.sourceId,
      targetId: edge.targetId,
      relationship: edge.relationship,
      slotId,
      href: hrefFor(target),
      label: edge.label ?? labelFor(target),
      order,
      targetTemplateId: target.templateId,
    };
    slots[slotId] = [...(slots[slotId] ?? []), resolved].sort((a, b) => a.order - b.order || a.label.localeCompare(b.label));
  }

  return slots;
}
