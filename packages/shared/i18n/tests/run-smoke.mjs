import assert from 'node:assert/strict';
import {
  createLocaleFallbackChain,
  createLocaleRegistry,
  createNamespacedLocaleCatalog,
  loadLocaleCatalogs,
} from '../dist/index.js';

const fallbackChain = createLocaleFallbackChain('es-MX', {
  defaultLocale: 'en',
  fallbackLocale: 'en',
});
assert.deepEqual(fallbackChain, ['es-mx', 'es', 'en']);

const catalogs = await loadLocaleCatalogs({
  locale: 'es-MX',
  defaultLocale: 'en',
  fallbackLocale: 'en',
  namespace: 'core.extension-manager',
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
assert.equal(catalogs.length, 2);
assert.equal(catalogs[0].locale, 'es');
assert.equal(catalogs[1].locale, 'en');
assert.equal(catalogs[0].messages['core.extension-manager.views.manager.title'], 'Administrador de extensiones');

const registry = createLocaleRegistry({ defaultLocale: 'en', fallbackLocale: 'en' });
for (const catalog of catalogs) {
  registry.registerCatalog(catalog);
}
registry.setLocale('es-MX');
assert.equal(
  registry.resolve({ key: 'core.extension-manager.views.manager.title', defaultMessage: 'Extension Manager' }),
  'Administrador de extensiones',
);

const namespaced = createNamespacedLocaleCatalog('core.demo', 'en', { greeting: 'Hello' });
assert.equal(namespaced.messages['core.demo.greeting'], 'Hello');

console.log('shared-i18n smoke: ok');
