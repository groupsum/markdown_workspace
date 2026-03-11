import React from 'react';
import { getBuiltInActionRailExtensions } from '../extensions/plugins';

export type ActionRailExtensionGroup = 'top' | 'bottom';

export interface ActionRailExtensionContext {
  dispatchEvent: (eventName: string, detail: Record<string, unknown>) => void;
  addToast: (message: string, tone: 'success' | 'error' | 'warning' | 'info') => void;
}

export interface ActionRailExtensionDefinition {
  id: string;
  title: string;
  icon: React.ReactNode;
  group?: ActionRailExtensionGroup;
  className?: string;
  order?: number;
  isEnabled?: () => boolean;
  onClick: (ctx: ActionRailExtensionContext) => void;
}

export interface ActionRailExtensionButton {
  id: string;
  title: string;
  icon: React.ReactNode;
  group: ActionRailExtensionGroup;
  className?: string;
  onClick: () => void;
}

const extensionRegistry = new Map<string, ActionRailExtensionDefinition>();

const dispatchAppEvent = (eventName: string, detail: Record<string, unknown>) => {
  window.dispatchEvent(new CustomEvent(eventName, { detail }));
};

const defaultExtensions: ActionRailExtensionDefinition[] = getBuiltInActionRailExtensions();

defaultExtensions.forEach((extension) => {
  extensionRegistry.set(extension.id, extension);
});

export const registerActionRailExtension = (extension: ActionRailExtensionDefinition) => {
  extensionRegistry.set(extension.id, extension);
};

export const unregisterActionRailExtension = (id: string) => {
  extensionRegistry.delete(id);
};

export const resolveActionRailExtensionButtons = (
  addToast: ActionRailExtensionContext['addToast']
): ActionRailExtensionButton[] => {
  const extensions = Array.from(extensionRegistry.values())
    .filter((extension) => extension.isEnabled?.() ?? true)
    .sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER));

  return extensions.map((extension) => ({
    id: extension.id,
    title: extension.title,
    icon: extension.icon,
    group: extension.group ?? 'bottom',
    className: extension.className,
    onClick: () => extension.onClick({ dispatchEvent: dispatchAppEvent, addToast })
  }));
};
