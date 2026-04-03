// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createClientI18nService } from './clientI18nService';
import { createLanguagePackStudioController } from './languagePackStudioController';
import { initializeLanguagePackStore, readStoredLanguagePacksSync } from './languagePackStore';

describe('languagePackStudioController', () => {
  beforeEach(async () => {
    window.localStorage.clear();
    if (typeof indexedDB !== 'undefined') {
      await new Promise<void>((resolve) => {
        const request = indexedDB.deleteDatabase('LatticeDB');
        request.onsuccess = () => resolve();
        request.onerror = () => resolve();
        request.onblocked = () => resolve();
      });
    }
    await initializeLanguagePackStore();
  });

  it('imports, activates, and removes a portable language pack', async () => {
    const i18n = createClientI18nService('en');
    const settingsWrites: Array<{ key: string; value: unknown }> = [];
    const controller = createLanguagePackStudioController({
      i18n,
      settingsStore: {
        async set(key, value) {
          settingsWrites.push({ key, value });
        },
      },
      loadTokenCatalog: async () => [
        { key: 'core.views.settings.title', defaultMessage: 'System Configuration', source: 'core' },
      ],
    });

    const pack = await controller.importArtifact(JSON.stringify({
      kind: 'mdwrk-language-pack',
      version: 1,
      locale: 'de',
      label: 'Deutsch Experimental',
      enabled: true,
      messages: {
        'core.views.settings.title': 'Systemkonfiguration',
      },
    }));

    expect(pack.locale).toBe('de');
    expect(readStoredLanguagePacksSync().some((entry) => entry.locale === 'de' && entry.source === 'installed')).toBe(true);

    await controller.activate('de');
    expect(i18n.getLocale()).toBe('de');
    expect(settingsWrites.some((entry) => entry.key === 'core.locale' && entry.value === 'de')).toBe(true);

    await controller.remove('de');
    expect(readStoredLanguagePacksSync().some((entry) => entry.locale === 'de' && entry.source === 'installed')).toBe(false);
    expect(i18n.getLocale()).toBe('en');
  });

  it('creates, exports, disables, and re-enables a language pack artifact', async () => {
    const i18n = createClientI18nService('en');
    const controller = createLanguagePackStudioController({
      i18n,
      settingsStore: {
        async set() {},
      },
      loadTokenCatalog: async () => [
        { key: 'core.views.settings.title', defaultMessage: 'System Configuration', source: 'core' },
        { key: 'core.commands.new-file', defaultMessage: 'Create New File', source: 'core' },
      ],
    });

    const pack = await controller.createArtifact({
      locale: 'it-custom',
      label: 'Italiano Custom',
      messages: {
        'core.views.settings.title': 'Configurazione di sistema',
      },
    });

    expect(pack.enabled).toBe(true);
    expect(controller.exportArtifact('it-custom')?.label).toBe('Italiano Custom');

    await controller.setEnabled('it-custom', false);
    expect(readStoredLanguagePacksSync().find((entry) => entry.locale === 'it-custom')?.enabled).toBe(false);

    await controller.setEnabled('it-custom', true);
    expect(readStoredLanguagePacksSync().find((entry) => entry.locale === 'it-custom')?.enabled).toBe(true);
  });

  it('shows built-in packs and can disable every pack at once', async () => {
    const i18n = createClientI18nService('en');
    const controller = createLanguagePackStudioController({
      i18n,
      settingsStore: {
        async set() {},
      },
      loadTokenCatalog: async () => [],
    });

    await initializeLanguagePackStore();
    expect(controller.getSnapshot().packs.some((entry) => entry.locale === 'en' && entry.source === 'built-in')).toBe(true);

    await controller.setAllEnabled(false);
    expect(controller.getSnapshot().packs.every((entry) => entry.enabled === false)).toBe(true);
    expect(i18n.getLocale()).toBe('en');
  });

  it('falls back to en when the active installed locale is disabled through bulk disable', async () => {
    const i18n = createClientI18nService('en');
    const controller = createLanguagePackStudioController({
      i18n,
      settingsStore: {
        async set() {},
      },
      loadTokenCatalog: async () => [
        { key: 'core.views.settings.title', defaultMessage: 'System Configuration', source: 'core' },
      ],
    });

    await controller.importArtifact(JSON.stringify({
      kind: 'mdwrk-language-pack',
      version: 1,
      locale: 'de',
      label: 'Deutsch',
      enabled: true,
      messages: {
        'core.views.settings.title': 'Systemkonfiguration',
      },
    }));

    await controller.activate('de');
    expect(i18n.getLocale()).toBe('de');

    await controller.setAllEnabled(false);
    expect(i18n.getLocale()).toBe('en');
    expect(controller.getSnapshot().packs.every((entry) => entry.enabled === false)).toBe(true);
  });
});
