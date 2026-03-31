import type { I18nLabel } from '@mdwrk/extension-manifest';
import {
  createLocaleRegistry,
  createNamespacedLocaleCatalog,
  loadLocaleCatalogs,
  type LocaleCatalog,
  type LocaleCatalogLoaderDefinition,
} from '@mdwrk/i18n';
import { createStoreEmitter, type ObservableStore } from '../common/observable';

export const CORE_LOCALE_STORAGE_KEY = 'mdwrk.core.locale';

export interface ClientI18nSnapshot {
  readonly locale: string;
}

interface RegisteredCatalogLoader {
  readonly namespace: string;
  readonly definition: LocaleCatalogLoaderDefinition;
  readonly loadedLocales: Set<string>;
}

export interface ClientI18nService extends ObservableStore<ClientI18nSnapshot> {
  getLocale(): string;
  setLocale(locale: string): void;
  ensureLocale(locale?: string): Promise<void>;
  registerCatalog(catalog: LocaleCatalog): void;
  registerNamespacedCatalog(namespace: string, catalog: LocaleCatalog): void;
  registerCatalogLoader(namespace: string, definition: LocaleCatalogLoaderDefinition): () => void;
  format(label: I18nLabel | string): string;
}

function readPersistedLocale(defaultLocale: string): string {
  if (typeof window === 'undefined') {
    return defaultLocale;
  }
  return window.localStorage.getItem(CORE_LOCALE_STORAGE_KEY) ?? defaultLocale;
}

function persistLocale(locale: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(CORE_LOCALE_STORAGE_KEY, locale);
}

export function createClientI18nService(defaultLocale = 'en'): ClientI18nService {
  const registry = createLocaleRegistry({ defaultLocale, fallbackLocale: defaultLocale });
  registry.setLocale(readPersistedLocale(defaultLocale));
  const emitter = createStoreEmitter();
  const loaders = new Map<string, RegisteredCatalogLoader>();
  let cachedSnapshot: ClientI18nSnapshot | null = { locale: registry.getLocale() };

  const emitChange = (): void => {
    cachedSnapshot = { locale: registry.getLocale() };
    emitter.emit();
  };

  const ensureLocale = async (locale = registry.getLocale()): Promise<void> => {
    const tasks = Array.from(loaders.values()).map(async (entry) => {
      const catalogs = await loadLocaleCatalogs({
        locale,
        defaultLocale: entry.definition.defaultLocale ?? defaultLocale,
        fallbackLocale: entry.definition.fallbackLocale ?? defaultLocale,
        loaders: entry.definition.loaders,
        namespace: entry.namespace,
      });

      for (const catalog of catalogs) {
        if (entry.loadedLocales.has(catalog.locale)) continue;
        registry.registerCatalog(catalog);
        entry.loadedLocales.add(catalog.locale);
      }
    });

    await Promise.all(tasks);
    emitChange();
  };

  return {
    getSnapshot(): ClientI18nSnapshot {
      if (!cachedSnapshot) {
        cachedSnapshot = { locale: registry.getLocale() };
      }
      return cachedSnapshot;
    },
    subscribe: emitter.subscribe,
    getLocale(): string {
      return registry.getLocale();
    },
    setLocale(locale: string): void {
      registry.setLocale(locale);
      persistLocale(registry.getLocale());
      void ensureLocale(locale);
      emitChange();
    },
    ensureLocale,
    registerCatalog(catalog: LocaleCatalog): void {
      registry.registerCatalog(catalog);
      emitChange();
    },
    registerNamespacedCatalog(namespace: string, catalog: LocaleCatalog): void {
      registry.registerCatalog(createNamespacedLocaleCatalog(namespace, catalog.locale, catalog.messages));
      emitChange();
    },
    registerCatalogLoader(namespace: string, definition: LocaleCatalogLoaderDefinition): () => void {
      const entry: RegisteredCatalogLoader = {
        namespace,
        definition,
        loadedLocales: new Set<string>(),
      };
      loaders.set(namespace, entry);
      void ensureLocale(registry.getLocale());
      return () => {
        if (loaders.get(namespace) === entry) {
          loaders.delete(namespace);
        }
      };
    },
    format(label: I18nLabel | string): string {
      if (typeof label === 'string') return label;
      return registry.resolve({
        key: label.key,
        defaultMessage: label.defaultMessage,
        description: label.description,
        values: label.values,
      }, label.values);
    },
  };
}
