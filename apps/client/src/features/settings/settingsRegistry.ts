import type { ExtensionIcon, ExtensionSettingsSchema, I18nLabel } from '@markdown-workspace/extension-manifest';
import type { Disposable, RegisteredSettingsSection } from '@markdown-workspace/extension-host';
import type { ReactNode } from 'react';
import { createStoreEmitter, type ObservableStore } from '../common/observable';

export type SettingsPanelId = 'visual' | 'git' | 'data' | 'keys' | 'session' | 'extensions' | 'advanced';

export interface ClientSettingsSection extends RegisteredSettingsSection {
  readonly title: I18nLabel;
  readonly panel: SettingsPanelId;
  readonly icon?: ExtensionIcon;
  readonly schema?: ExtensionSettingsSchema;
  readonly render?: () => ReactNode;
}

export interface SettingsRegistrySnapshot {
  readonly sections: readonly ClientSettingsSection[];
}

export interface SettingsRegistry extends ObservableStore<SettingsRegistrySnapshot> {
  register(section: ClientSettingsSection): Disposable;
  listSync(): readonly ClientSettingsSection[];
  listByPanel(panel: SettingsPanelId): readonly ClientSettingsSection[];
}

export function createSettingsRegistry(): SettingsRegistry {
  const sections = new Map<string, ClientSettingsSection>();
  const emitter = createStoreEmitter();

  const ordered = () =>
    Array.from(sections.values()).sort((left, right) => {
      const panelDelta = left.panel.localeCompare(right.panel);
      if (panelDelta !== 0) return panelDelta;
      const orderDelta = (left.order ?? 0) - (right.order ?? 0);
      if (orderDelta !== 0) return orderDelta;
      return left.title.defaultMessage.localeCompare(right.title.defaultMessage);
    });

  return {
    getSnapshot(): SettingsRegistrySnapshot {
      return { sections: ordered() };
    },
    subscribe: emitter.subscribe,
    register(section: ClientSettingsSection): Disposable {
      sections.set(section.id, section);
      emitter.emit();
      return {
        dispose(): void {
          if (sections.get(section.id) === section) {
            sections.delete(section.id);
            emitter.emit();
          }
        },
      };
    },
    listSync(): readonly ClientSettingsSection[] {
      return ordered();
    },
    listByPanel(panel: SettingsPanelId): readonly ClientSettingsSection[] {
      return ordered().filter((section) => section.panel === panel);
    },
  };
}
