import type { NavItem, ResolvedLinkSlots, ResolvedTemplateLink } from "../types.js";

export function linksForSlot(slots: ResolvedLinkSlots, slotId: string): ResolvedTemplateLink[] {
  return slots[slotId] ?? [];
}

export function firstLinkForSlot(slots: ResolvedLinkSlots, slotId: string): ResolvedTemplateLink | undefined {
  return linksForSlot(slots, slotId)[0];
}

export function navItemsForSlot(slots: ResolvedLinkSlots, slotId: string): NavItem[] {
  return linksForSlot(slots, slotId).map((link) => ({ label: link.label, href: link.href }));
}

export function allLinksForRole(slots: ResolvedLinkSlots, role: ResolvedTemplateLink["role"]): ResolvedTemplateLink[] {
  return Object.values(slots).flat().filter((link) => link.role === role);
}
