import type { LocaleCatalog, LocaleCatalogMessages } from "./types.js";

export type LocaleCatalogLoader = () => LocaleCatalog | Promise<LocaleCatalog>;
export type LocaleCatalogLoaderRecord = Readonly<Record<string, LocaleCatalogLoader>>;

export interface LocaleCatalogLoaderDefinition {
  readonly defaultLocale?: string;
  readonly fallbackLocale?: string;
  readonly loaders: LocaleCatalogLoaderRecord;
}

export interface LoadLocaleCatalogsOptions {
  readonly locale: string;
  readonly defaultLocale?: string;
  readonly fallbackLocale?: string;
  readonly loaders: LocaleCatalogLoaderRecord;
  readonly namespace?: string;
}

function normalizeLocale(locale: string): string {
  return locale.trim().replace(/_/g, "-").toLowerCase();
}

function qualifyMessageKey(namespace: string | undefined, key: string): string {
  if (!namespace) return key;
  return key.startsWith(`${namespace}.`) ? key : `${namespace}.${key}`;
}

export function createLocaleFallbackChain(
  locale: string,
  options: { readonly defaultLocale?: string; readonly fallbackLocale?: string } = {},
): readonly string[] {
  const normalizedLocale = normalizeLocale(locale);
  const defaultLocale = normalizeLocale(options.defaultLocale ?? "en");
  const fallbackLocale = normalizeLocale(options.fallbackLocale ?? defaultLocale);
  const segments = normalizedLocale.split("-").filter(Boolean);
  const candidates: string[] = [];

  for (let index = segments.length; index > 0; index -= 1) {
    candidates.push(segments.slice(0, index).join("-"));
  }

  if (!candidates.includes(fallbackLocale)) {
    candidates.push(fallbackLocale);
  }
  if (!candidates.includes(defaultLocale)) {
    candidates.push(defaultLocale);
  }

  return Object.freeze(candidates.filter(Boolean));
}

export function createNamespacedLocaleCatalog(
  namespace: string,
  locale: string,
  messages: LocaleCatalogMessages,
): LocaleCatalog {
  return {
    locale,
    messages: Object.freeze(
      Object.fromEntries(
        Object.entries(messages).map(([key, value]) => [qualifyMessageKey(namespace, key), value]),
      ),
    ),
  };
}

export async function loadLocaleCatalogs(options: LoadLocaleCatalogsOptions): Promise<readonly LocaleCatalog[]> {
  const chain = createLocaleFallbackChain(options.locale, {
    defaultLocale: options.defaultLocale,
    fallbackLocale: options.fallbackLocale,
  });
  const loaded: LocaleCatalog[] = [];
  const seen = new Set<string>();

  for (const candidate of chain) {
    const loader = options.loaders[candidate];
    if (!loader || seen.has(candidate)) continue;
    const catalog = await loader();
    loaded.push(
      options.namespace
        ? createNamespacedLocaleCatalog(options.namespace, catalog.locale, catalog.messages)
        : catalog,
    );
    seen.add(candidate);
  }

  return Object.freeze(loaded);
}
