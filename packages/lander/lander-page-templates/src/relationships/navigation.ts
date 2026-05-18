import type { NavItem, PageInstance, TemplateGraph, TemplateNavigation } from "../types.js";
import { firstLinkForSlot, navItemsForSlot } from "./link-slots.js";
import { resolveLinkSlots } from "./resolve.js";

function itemFor(instance: PageInstance): NavItem {
  return { label: instance.label ?? instance.title, href: instance.href ?? instance.slug };
}

export function deriveTemplateNavigation(graph: TemplateGraph, sourceId: string): TemplateNavigation {
  const instance = graph.instances.find((item) => item.id === sourceId);
  const links = resolveLinkSlots(graph, sourceId);
  const parent = firstLinkForSlot(links, "parent");
  const previous = firstLinkForSlot(links, "previous");
  const next = firstLinkForSlot(links, "next");
  const related = [
    ...navItemsForSlot(links, "related"),
    ...navItemsForSlot(links, "children"),
    ...navItemsForSlot(links, "support"),
    ...navItemsForSlot(links, "legal"),
  ];

  return {
    breadcrumbs: [
      { label: "Home", href: "/" },
      ...(parent ? [{ label: parent.label, href: parent.href }] : []),
      ...(instance ? [itemFor(instance)] : []),
    ],
    related,
    previous: previous ? { label: previous.label, href: previous.href } : undefined,
    next: next ? { label: next.label, href: next.href } : undefined,
  };
}
