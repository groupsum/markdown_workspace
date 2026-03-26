import type { Disposable, RegisteredView } from '@mdwrk/extension-host';
import { createStoreEmitter, type ObservableStore } from '../common/observable';

export interface ClientViewRenderProps {
  readonly viewId: string;
  readonly input: unknown;
  readonly isOpen: boolean;
  close(): Promise<void>;
  focus(): Promise<void>;
}

export interface ClientViewDefinition extends Omit<RegisteredView, 'render'> {
  readonly render: (props: ClientViewRenderProps) => unknown;
  readonly onOpen?: (input?: unknown) => void | Promise<void>;
  readonly onClose?: () => void | Promise<void>;
  readonly onFocus?: () => void | Promise<void>;
}

export interface ViewRegistrySnapshot {
  readonly views: readonly ClientViewDefinition[];
  readonly openViewIds: readonly string[];
  readonly activeViewId: string | null;
  readonly inputs: Readonly<Record<string, unknown>>;
}

export interface ViewRegistry extends ObservableStore<ViewRegistrySnapshot> {
  register(view: ClientViewDefinition): Disposable;
  listSync(): readonly ClientViewDefinition[];
  get(id: string): ClientViewDefinition | undefined;
  isOpen(id: string): boolean;
  getInput(id: string): unknown;
  open(id: string, input?: unknown): Promise<void>;
  close(id: string): Promise<void>;
  focus(id: string): Promise<void>;
}

const byTitle = (left: ClientViewDefinition, right: ClientViewDefinition) =>
  left.title.defaultMessage.localeCompare(right.title.defaultMessage);

export function createViewRegistry(): ViewRegistry {
  const views = new Map<string, ClientViewDefinition>();
  const openViewIds = new Set<string>();
  const inputs = new Map<string, unknown>();
  let activeViewId: string | null = null;
  const emitter = createStoreEmitter();
  let snapshot: ViewRegistrySnapshot = {
    views: [],
    openViewIds: [],
    activeViewId: null,
    inputs: Object.freeze({}),
  };

  const buildSnapshot = (): ViewRegistrySnapshot => ({
    views: Array.from(views.values()).sort(byTitle),
    openViewIds: Array.from(openViewIds.values()),
    activeViewId,
    inputs: Object.freeze(Object.fromEntries(inputs.entries())),
  });
  const emitSnapshot = () => {
    snapshot = buildSnapshot();
    emitter.emit();
  };

  return {
    getSnapshot(): ViewRegistrySnapshot {
      return snapshot;
    },
    subscribe: emitter.subscribe,
    register(view: ClientViewDefinition): Disposable {
      views.set(view.id, view);
      emitSnapshot();
      return {
        dispose(): void {
          if (views.get(view.id) === view) {
            views.delete(view.id);
            openViewIds.delete(view.id);
            inputs.delete(view.id);
            if (activeViewId === view.id) {
              activeViewId = null;
            }
            emitSnapshot();
          }
        },
      };
    },
    listSync(): readonly ClientViewDefinition[] {
      return buildSnapshot().views;
    },
    get(id: string): ClientViewDefinition | undefined {
      return views.get(id);
    },
    isOpen(id: string): boolean {
      return openViewIds.has(id);
    },
    getInput(id: string): unknown {
      return inputs.get(id);
    },
    async open(id: string, input?: unknown): Promise<void> {
      const view = views.get(id);
      if (!view) {
        throw new Error(`View not found: ${id}`);
      }
      if (!view.allowMultiple) {
        openViewIds.add(id);
        inputs.set(id, input);
      }
      activeViewId = id;
      emitSnapshot();
      await view.onOpen?.(input);
    },
    async close(id: string): Promise<void> {
      const view = views.get(id);
      if (!view) {
        return;
      }
      openViewIds.delete(id);
      inputs.delete(id);
      if (activeViewId === id) {
        activeViewId = null;
      }
      emitSnapshot();
      await view.onClose?.();
    },
    async focus(id: string): Promise<void> {
      if (!views.has(id)) {
        return;
      }
      activeViewId = id;
      emitSnapshot();
      await views.get(id)?.onFocus?.();
    },
  };
}
