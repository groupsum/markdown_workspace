import type { Disposable, RegisteredView } from '@mdwrk/extension-host';
import { createStoreEmitter, type ObservableStore } from '../common/observable';
import type { AppMode } from '../../../types';

export interface ClientViewRenderProps {
  readonly viewId: string;
  readonly input: unknown;
  readonly isOpen: boolean;
  readonly workspaceSidebarOpen?: boolean;
  setWorkspaceSidebarOpen?(open: boolean): void;
  close(): Promise<void>;
  focus(): Promise<void>;
}

export interface ClientViewDefinition extends Omit<RegisteredView, 'render'> {
  readonly render: (props: ClientViewRenderProps) => unknown;
  readonly renderSidebar?: (props: ClientViewRenderProps) => unknown;
  readonly onOpen?: (input?: unknown) => void | Promise<void>;
  readonly onClose?: () => void | Promise<void>;
  readonly onFocus?: () => void | Promise<void>;
}

export interface ViewRegistrySnapshot {
  readonly views: readonly ClientViewDefinition[];
  readonly openViewIds: readonly string[];
  readonly activeViewId: string | null;
  readonly activeMainViewId: string | null;
  readonly inputs: Readonly<Record<string, unknown>>;
}

export interface ViewRegistry extends ObservableStore<ViewRegistrySnapshot> {
  register(view: ClientViewDefinition): Disposable;
  listSync(): readonly ClientViewDefinition[];
  get(id: string): ClientViewDefinition | undefined;
  isOpen(id: string): boolean;
  getInput(id: string): unknown;
  open(id: string, input?: unknown): Promise<void>;
  toggle(id: string, input?: unknown): Promise<void>;
  close(id: string): Promise<void>;
  focus(id: string): Promise<void>;
}

const byTitle = (left: ClientViewDefinition, right: ClientViewDefinition) =>
  left.title.defaultMessage.localeCompare(right.title.defaultMessage);

interface ViewRegistryOptions {
  readonly resolveAppMode?: (view: ClientViewDefinition) => AppMode | null;
  readonly onAppModeChange?: (mode: AppMode) => void;
}

const getActiveMainViewId = (
  views: Map<string, ClientViewDefinition>,
  openViewIds: Set<string>,
  activeViewId: string | null,
): string | null => {
  if (activeViewId) {
    const activeView = views.get(activeViewId);
    if (activeView?.location === 'main' && openViewIds.has(activeViewId)) {
      return activeViewId;
    }
  }

  for (const viewId of openViewIds.values()) {
    const view = views.get(viewId);
    if (view?.location === 'main') {
      return viewId;
    }
  }

  return null;
};

export function createViewRegistry(options: ViewRegistryOptions = {}): ViewRegistry {
  const views = new Map<string, ClientViewDefinition>();
  const openViewIds = new Set<string>();
  const inputs = new Map<string, unknown>();
  let activeViewId: string | null = null;
  const emitter = createStoreEmitter();
  let cachedSnapshot: ViewRegistrySnapshot | null = null;

  const buildSnapshot = (): ViewRegistrySnapshot => ({
    views: Array.from(views.values()).sort(byTitle),
    openViewIds: Array.from(openViewIds.values()),
    activeViewId,
    activeMainViewId: getActiveMainViewId(views, openViewIds, activeViewId),
    inputs: Object.freeze(Object.fromEntries(inputs.entries())),
  });

  const emitChange = (): void => {
    cachedSnapshot = null;
    emitter.emit();
  };

  const setAppModeForView = (view: ClientViewDefinition | undefined): void => {
    const nextMode = view ? (options.resolveAppMode?.(view) ?? null) : 'work';
    if (nextMode) {
      options.onAppModeChange?.(nextMode);
    }
  };

  const closeViewInternal = async (id: string): Promise<void> => {
    const view = views.get(id);
    if (!view || !openViewIds.has(id)) {
      return;
    }

    openViewIds.delete(id);
    inputs.delete(id);
    if (activeViewId === id) {
      activeViewId = null;
    }

    emitChange();
    await view.onClose?.();
  };

  const openViewInternal = async (id: string, input?: unknown): Promise<void> => {
    const view = views.get(id);
    if (!view) {
      throw new Error(`View not found: ${id}`);
    }
    if (view.location === 'main') {
      const openMainViewIds = Array.from(openViewIds.values()).filter((viewId) => {
        if (viewId === id) {
          return false;
        }
        return views.get(viewId)?.location === 'main';
      });

      for (const viewId of openMainViewIds) {
        await closeViewInternal(viewId);
      }
    }
    if (!view.allowMultiple) {
      openViewIds.add(id);
      inputs.set(id, input);
    }
    activeViewId = id;
    emitChange();
    if (view.location === 'main') {
      setAppModeForView(view);
    }
    await view.onOpen?.(input);
  };

  return {
    getSnapshot(): ViewRegistrySnapshot {
      if (!cachedSnapshot) {
        cachedSnapshot = buildSnapshot();
      }
      return cachedSnapshot;
    },
    subscribe: emitter.subscribe,
    register(view: ClientViewDefinition): Disposable {
      views.set(view.id, view);
      emitChange();
      return {
        dispose(): void {
          if (views.get(view.id) === view) {
            views.delete(view.id);
            openViewIds.delete(view.id);
            inputs.delete(view.id);
            if (activeViewId === view.id) {
              activeViewId = null;
            }
            if (view.location === 'main') {
              setAppModeForView(undefined);
            }
            emitChange();
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
      await openViewInternal(id, input);
    },
    async toggle(id: string, input?: unknown): Promise<void> {
      const view = views.get(id);
      if (!view) {
        throw new Error(`View not found: ${id}`);
      }

      if (view.location === 'main' && openViewIds.has(id) && activeViewId === id) {
        await closeViewInternal(id);
        setAppModeForView(undefined);
        return;
      }

      await openViewInternal(id, input);
    },
    async close(id: string): Promise<void> {
      const view = views.get(id);
      if (!view) {
        return;
      }
      await closeViewInternal(id);
      if (view.location === 'main') {
        setAppModeForView(undefined);
      }
    },
    async focus(id: string): Promise<void> {
      if (!views.has(id)) {
        return;
      }
      activeViewId = id;
      emitChange();
      const view = views.get(id);
      if (view?.location === 'main' && openViewIds.has(id)) {
        setAppModeForView(view);
      }
      await views.get(id)?.onFocus?.();
    },
  };
}
