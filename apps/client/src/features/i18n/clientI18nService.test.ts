import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CORE_SHELL_LOCALE_LOADER_DEFINITION, CORE_SHELL_SUPPORTED_LOCALES } from '@mdwrk/i18n';
import { createClientI18nService } from './clientI18nService';

const storage = new Map<string, string>();

const SYSTEM_CONFIGURATION_MENU_KEYS = [
  'core.settings.group.general',
  'core.settings.group.advanced',
  'core.settings.group.data',
  'core.settings.group.extensions',
  'core.settings.group.git',
  'core.settings.group.keys',
  'core.settings.group.language',
  'core.settings.group.session',
  'core.settings.group.visual',
  'core.settings.sidebar.@mdwrk/extension-manager.settings.label',
  'core.settings.sidebar.@mdwrk/extension-theme-studio.settings.label',
  'core.settings.sidebar.core.extension-manager.settings.label',
  'core.settings.sidebar.core.gemini-agent.settings.label',
  'core.settings.sidebar.core.git-ops.settings.label',
  'core.settings.sidebar.core.language-pack-studio.settings.label',
  'core.settings.sidebar.core.theme-studio.settings.label',
  'core.settings.sidebar.core.workspace-files.settings.label',
  'core.settings.sidebar.core.settings.data.label',
  'core.settings.sidebar.core.settings.extensions.runtime.label',
  'core.settings.sidebar.core.settings.git.label',
  'core.settings.sidebar.core.settings.keys.label',
  'core.settings.sidebar.core.settings.language.label',
  'core.settings.sidebar.core.settings.language-packs.label',
  'core.settings.sidebar.core.settings.markdown-profiles.label',
  'core.settings.sidebar.core.settings.session.label',
  'core.settings.sidebar.core.settings.visual.label',
  'core.settings.sidebar.core.settings.workspace-preferences.label',
] as const;

beforeEach(() => {
  storage.clear();
  vi.stubGlobal('window', {
    localStorage: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => { storage.set(key, value); },
    },
  });
});

describe('client i18n service', () => {
  it('returns a stable snapshot reference until locale changes', () => {
    const service = createClientI18nService('en');

    const firstSnapshot = service.getSnapshot();
    const secondSnapshot = service.getSnapshot();

    expect(secondSnapshot).toBe(firstSnapshot);

    service.setLocale('es');
    const thirdSnapshot = service.getSnapshot();

    expect(thirdSnapshot).not.toBe(firstSnapshot);
    expect(thirdSnapshot.locale).toBe('es');
  });

  it('registers catalogs and formats labels', () => {
    const service = createClientI18nService('en');
    service.registerCatalog({
      locale: 'en',
      messages: {
        'core.hello': 'Hello {name}',
      },
    });

    expect(service.format({ key: 'core.hello', defaultMessage: 'Fallback {name}', values: { name: 'Ada' } })).toBe('Hello Ada');
  });

  it('loads namespaced locale catalogs and resolves locale fallbacks', async () => {
    const service = createClientI18nService('en');

    service.registerCatalogLoader('core.extension-manager', {
      defaultLocale: 'en',
      fallbackLocale: 'en',
      loaders: {
        en: async () => ({
          locale: 'en',
          messages: {
            'views.manager.title': 'Extension Manager',
          },
        }),
        es: async () => ({
          locale: 'es',
          messages: {
            'views.manager.title': 'Administrador de extensiones',
          },
        }),
      },
    });

    await service.ensureLocale('es-MX');
    service.setLocale('es-MX');

    expect(service.format({
      key: 'core.extension-manager.views.manager.title',
      defaultMessage: 'Extension Manager',
    })).toBe('Administrador de extensiones');
  });

  it('persists locale selection and loads shared core shell catalogs', async () => {
    storage.set('mdwrk.core.locale', 'pt');
    const service = createClientI18nService('en');
    service.registerCatalogLoader('core', CORE_SHELL_LOCALE_LOADER_DEFINITION);
    await service.ensureLocale();

    expect(service.getLocale()).toBe('pt');
    expect(service.format({ key: 'core.settings.language.title', defaultMessage: 'Language & Locale' })).toBe('Idioma e localidade');

    service.setLocale('ur');
    expect(storage.get('mdwrk.core.locale')).toBe('ur');
  });

  it('ships system configuration menu labels in every built-in language pack', async () => {
    for (const { id } of CORE_SHELL_SUPPORTED_LOCALES) {
      const catalog = await CORE_SHELL_LOCALE_LOADER_DEFINITION.loaders[id]?.();
      expect(catalog, `missing core shell catalog for ${id}`).toBeTruthy();
      for (const key of SYSTEM_CONFIGURATION_MENU_KEYS) {
        expect(catalog?.messages[key], `${id} is missing ${key}`).toBeTruthy();
      }
    }
  });
});
