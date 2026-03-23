import { formatMessage, normalizeMessageDescriptor } from "./format.js";
import type { LocaleCatalog, LocaleRegistryOptions, MessageDescriptor, MessageValue } from "./types.js";

export interface LocaleRegistry {
  getLocale(): string;
  setLocale(locale: string): void;
  registerCatalog(catalog: LocaleCatalog): void;
  hasMessage(key: string, locale?: string): boolean;
  resolve(
    descriptor: string | MessageDescriptor,
    values?: Readonly<Record<string, MessageValue>>,
  ): string;
}

function normalizeLocale(locale: string): string {
  return locale.trim().replace(/_/g, "-").toLowerCase();
}

function createLocaleChain(locale: string, fallbackLocale: string, defaultLocale: string): readonly string[] {
  const normalizedLocale = normalizeLocale(locale);
  const normalizedFallback = normalizeLocale(fallbackLocale);
  const normalizedDefault = normalizeLocale(defaultLocale);
  const segments = normalizedLocale.split("-").filter(Boolean);
  const candidates: string[] = [];

  for (let index = segments.length; index > 0; index -= 1) {
    candidates.push(segments.slice(0, index).join("-"));
  }

  if (!candidates.includes(normalizedFallback)) {
    candidates.push(normalizedFallback);
  }
  if (!candidates.includes(normalizedDefault)) {
    candidates.push(normalizedDefault);
  }

  return Object.freeze(candidates.filter(Boolean));
}

export function createLocaleRegistry(options: LocaleRegistryOptions = {}): LocaleRegistry {
  const defaultLocale = normalizeLocale(options.defaultLocale ?? "en");
  const fallbackLocale = normalizeLocale(options.fallbackLocale ?? defaultLocale);
  const catalogs = new Map<string, Map<string, MessageDescriptor>>();
  let activeLocale = defaultLocale;

  const getCatalog = (locale: string): Map<string, MessageDescriptor> => {
    const normalizedLocale = normalizeLocale(locale);
    const existing = catalogs.get(normalizedLocale);
    if (existing) return existing;
    const created = new Map<string, MessageDescriptor>();
    catalogs.set(normalizedLocale, created);
    return created;
  };

  const findMessage = (key: string, locale: string): MessageDescriptor | undefined => {
    for (const candidate of createLocaleChain(locale, fallbackLocale, defaultLocale)) {
      const message = getCatalog(candidate).get(key);
      if (message) return message;
    }
    return undefined;
  };

  return {
    getLocale(): string {
      return activeLocale;
    },
    setLocale(locale: string): void {
      activeLocale = normalizeLocale(locale);
    },
    registerCatalog(catalog: LocaleCatalog): void {
      const target = getCatalog(catalog.locale);
      for (const [key, descriptor] of Object.entries(catalog.messages)) {
        target.set(key, normalizeMessageDescriptor(descriptor, key));
      }
    },
    hasMessage(key: string, locale = activeLocale): boolean {
      return Boolean(findMessage(key, locale));
    },
    resolve(descriptor: string | MessageDescriptor, values): string {
      const normalized = normalizeMessageDescriptor(descriptor);
      const key = normalized.key;
      if (key) {
        const translated = findMessage(key, activeLocale);
        if (translated) {
          return formatMessage({ ...translated, key }, values);
        }
      }
      return formatMessage(normalized, values);
    },
  };
}
