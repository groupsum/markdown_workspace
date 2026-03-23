import type { ExtensionIcon } from '@markdown-workspace/extension-manifest';
import type { Disposable, RegisteredActionRailItem } from '@markdown-workspace/extension-host';
import { createStoreEmitter, type ObservableStore } from '../common/observable';

export interface ClientActionRailItem extends RegisteredActionRailItem {
  readonly icon: ExtensionIcon;
  readonly tooltip?: string;
  readonly isActive?: () => boolean;
  readonly isDisabled?: () => boolean;
}

export interface ActionRailRegistrySnapshot {
  readonly items: readonly (ClientActionRailItem & { readonly badge: number | null })[];
  readonly lastRevealedId: string | null;
}

export interface ActionRailRegistry extends ObservableStore<ActionRailRegistrySnapshot> {
  register(item: ClientActionRailItem): Disposable;
  listSync(): readonly (ClientActionRailItem & { readonly badge: number | null })[];
  get(id: string): ClientActionRailItem | undefined;
  setBadge(id: string, value: number | null): Promise<void>;
  reveal(id: string): Promise<void>;
}

const GROUP_ORDER: Record<string, number> = {
  'workspace.primary': 10,
  'workspace.secondary': 20,
  assistant: 30,
  appearance: 40,
  extensions: 50,
  system: 60,
};

export function createActionRailRegistry(): ActionRailRegistry {
  const items = new Map<string, ClientActionRailItem>();
  const badges = new Map<string, number | null>();
  let lastRevealedId: string | null = null;
  const emitter = createStoreEmitter();

  const listItems = () =>
    Array.from(items.values())
      .sort((left, right) => {
        const groupDelta = (GROUP_ORDER[left.group ?? 'workspace.secondary'] ?? 99)
          - (GROUP_ORDER[right.group ?? 'workspace.secondary'] ?? 99);
        if (groupDelta !== 0) return groupDelta;
        const orderDelta = (left.order ?? 0) - (right.order ?? 0);
        if (orderDelta !== 0) return orderDelta;
        return left.title.defaultMessage.localeCompare(right.title.defaultMessage);
      })
      .map((item) => ({ ...item, badge: badges.get(item.id) ?? null }));

  return {
    getSnapshot(): ActionRailRegistrySnapshot {
      return {
        items: listItems(),
        lastRevealedId,
      };
    },
    subscribe: emitter.subscribe,
    register(item: ClientActionRailItem): Disposable {
      items.set(item.id, item);
      emitter.emit();
      return {
        dispose(): void {
          if (items.get(item.id) === item) {
            items.delete(item.id);
            badges.delete(item.id);
            if (lastRevealedId === item.id) {
              lastRevealedId = null;
            }
            emitter.emit();
          }
        },
      };
    },
    listSync() {
      return listItems();
    },
    get(id: string): ClientActionRailItem | undefined {
      return items.get(id);
    },
    async setBadge(id: string, value: number | null): Promise<void> {
      badges.set(id, value);
      emitter.emit();
    },
    async reveal(id: string): Promise<void> {
      lastRevealedId = id;
      emitter.emit();
    },
  };
}
