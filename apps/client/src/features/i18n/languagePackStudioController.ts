import type { ClientI18nService } from './clientI18nService';
import type { LanguagePackArtifact } from './languagePackStore';
import {
  initializeLanguagePackStore,
  normalizeLanguagePackArtifact,
  readStoredLanguagePacksSync,
  removeStoredLanguagePack,
  setAllStoredLanguagePackEnabled,
  setStoredLanguagePackEnabled,
  subscribeStoredLanguagePacks,
  upsertStoredLanguagePack,
} from './languagePackStore';
import type { LanguageTokenDefinition } from './languageTokenCatalog';

export interface LanguagePackStudioSnapshot {
  readonly activeLocale: string;
  readonly packs: readonly LanguagePackArtifact[];
  readonly tokens: readonly LanguageTokenDefinition[];
  readonly loadingTokens: boolean;
}

export interface LanguagePackStudioController {
  getSnapshot(): LanguagePackStudioSnapshot;
  subscribe(listener: () => void): () => void;
  importArtifact(payload: string): Promise<LanguagePackArtifact>;
  createArtifact(input: {
    locale: string;
    label: string;
    messages: Record<string, string>;
    enabled?: boolean;
  }): Promise<LanguagePackArtifact>;
  activate(locale: string): Promise<void>;
  remove(locale: string): Promise<void>;
  setEnabled(locale: string, enabled: boolean): Promise<void>;
  setAllEnabled(enabled: boolean): Promise<void>;
  exportArtifact(locale: string): LanguagePackArtifact | null;
}

export interface LanguagePackStudioControllerOptions {
  readonly i18n: ClientI18nService;
  readonly settingsStore: {
    set<T = unknown>(key: string, value: T): Promise<void>;
  };
  readonly loadTokenCatalog: () => Promise<readonly LanguageTokenDefinition[]>;
}

export function createLanguagePackStudioController(options: LanguagePackStudioControllerOptions): LanguagePackStudioController {
  let snapshot: LanguagePackStudioSnapshot = {
    activeLocale: options.i18n.getLocale(),
    packs: readStoredLanguagePacksSync(),
    tokens: [],
    loadingTokens: true,
  };
  const listeners = new Set<() => void>();

  const emit = () => {
    snapshot = {
      ...snapshot,
      activeLocale: options.i18n.getLocale(),
      packs: readStoredLanguagePacksSync(),
    };
    for (const listener of listeners) {
      listener();
    }
  };

  void options.loadTokenCatalog().then((tokens) => {
    snapshot = {
      ...snapshot,
      tokens,
      loadingTokens: false,
    };
    for (const listener of listeners) {
      listener();
    }
  });
  void initializeLanguagePackStore().then(() => {
    emit();
  });

  return {
    getSnapshot() {
      return snapshot;
    },
    subscribe(listener) {
      listeners.add(listener);
      const unsubscribePacks = subscribeStoredLanguagePacks(() => {
        emit();
      });
      const unsubscribeI18n = options.i18n.subscribe(() => {
        emit();
      });
      return () => {
        listeners.delete(listener);
        unsubscribePacks();
        unsubscribeI18n();
      };
    },
    async importArtifact(payload) {
      const parsed = normalizeLanguagePackArtifact(JSON.parse(payload));
      if (!parsed) {
        throw new Error('Invalid language pack artifact.');
      }
      await upsertStoredLanguagePack(parsed);
      if (parsed.enabled) {
        options.i18n.registerCatalog({ locale: parsed.locale, messages: parsed.messages });
        await options.i18n.ensureLocale(parsed.locale);
      }
      emit();
      return parsed;
    },
    async createArtifact(input) {
      const pack = normalizeLanguagePackArtifact({
        kind: 'mdwrk-language-pack',
        version: 1,
        locale: input.locale,
        label: input.label,
        enabled: input.enabled ?? true,
        messages: input.messages,
      });
      if (!pack) {
        throw new Error('Locale and at least one message are required.');
      }
      await upsertStoredLanguagePack(pack);
      if (pack.enabled) {
        options.i18n.registerCatalog({ locale: pack.locale, messages: pack.messages });
        await options.i18n.ensureLocale(pack.locale);
      }
      emit();
      return pack;
    },
    async activate(locale) {
      const target = readStoredLanguagePacksSync().find((pack) => pack.locale === locale);
      if (!target) {
        throw new Error(`Unknown locale: ${locale}`);
      }
      if (target.enabled) {
        if (Object.keys(target.messages).length > 0) {
          options.i18n.registerCatalog({ locale: target.locale, messages: target.messages });
        }
        options.i18n.setLocale(target.locale);
        await options.i18n.ensureLocale(target.locale);
        await options.settingsStore.set('core.locale', target.locale);
      }
      emit();
    },
    async remove(locale) {
      const activeLocale = options.i18n.getLocale();
      const target = readStoredLanguagePacksSync().find((pack) => pack.locale === locale);
      if (!target || target.source === 'built-in') {
        return;
      }
      await removeStoredLanguagePack(locale);
      if (activeLocale === locale) {
        options.i18n.setLocale('en');
        await options.i18n.ensureLocale('en');
        await options.settingsStore.set('core.locale', 'en');
      }
      emit();
    },
    async setEnabled(locale, enabled) {
      await setStoredLanguagePackEnabled(locale, enabled);
      const target = readStoredLanguagePacksSync().find((pack) => pack.locale === locale);
      if (enabled && target && Object.keys(target.messages).length > 0) {
        options.i18n.registerCatalog({ locale: target.locale, messages: target.messages });
        await options.i18n.ensureLocale(target.locale);
      }
      if (!enabled && options.i18n.getLocale() === locale) {
        options.i18n.setLocale('en');
        await options.i18n.ensureLocale('en');
        await options.settingsStore.set('core.locale', 'en');
      }
      emit();
    },
    async setAllEnabled(enabled) {
      const next = await setAllStoredLanguagePackEnabled(enabled);
      for (const pack of next) {
        if (pack.enabled && Object.keys(pack.messages).length > 0) {
          options.i18n.registerCatalog({ locale: pack.locale, messages: pack.messages });
        }
      }
      if (!next.some((pack) => pack.locale === options.i18n.getLocale() && pack.enabled)) {
        options.i18n.setLocale('en');
        await options.i18n.ensureLocale('en');
        await options.settingsStore.set('core.locale', 'en');
      }
      emit();
    },
    exportArtifact(locale) {
      const target = readStoredLanguagePacksSync().find((pack) => pack.locale === locale) ?? null;
      return target?.source === 'installed' ? target : null;
    },
  };
}
