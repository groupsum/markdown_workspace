import { describe, expect, it } from 'vitest';
import { createClientI18nService } from './clientI18nService';

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
});
