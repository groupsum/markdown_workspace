# mdwrk/i18n

Shared message descriptor, locale catalog, locale loader, and locale registry helpers for MdWrk packages.

Phase 10 also adds the shared core shell locale helpers used by the client app to restore the shipped core locales `en`, `es`, `fr`, `pt`, and `ur`.

## Core features

- keyed message descriptors
- locale registries with fallback resolution
- namespaced catalog helpers for package-local message keys
- locale loader definitions for lazy per-locale imports

## Example

```ts
import {
  createLocaleRegistry,
  createNamespacedLocaleCatalog,
  loadLocaleCatalogs,
} from "@mdwrk/i18n";

const registry = createLocaleRegistry({ defaultLocale: "en", fallbackLocale: "en" });

const catalogs = await loadLocaleCatalogs({
  locale: "es-MX",
  namespace: "core.extension-manager",
  loaders: {
    en: async () => ({ locale: "en", messages: { "view.title": "Extension Manager" } }),
    es: async () => ({ locale: "es", messages: { "view.title": "Administrador de extensiones" } }),
  },
});

for (const catalog of catalogs) {
  registry.registerCatalog(catalog);
}

registry.setLocale("es-MX");
registry.resolve({
  key: "core.extension-manager.view.title",
  defaultMessage: "Extension Manager",
});
```

## Core shell locale helpers

This package now also exports:

- `CORE_SHELL_SUPPORTED_LOCALES`
- `CORE_SHELL_LOCALE_LOADER_DEFINITION`

These helpers are used by the client runtime to register the core shell locale inventory and to resolve locale fallbacks for the restored language selector surfaces.
