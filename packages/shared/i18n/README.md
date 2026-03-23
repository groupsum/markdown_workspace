# @markdown-workspace/i18n

Shared message descriptor, locale catalog, locale loader, and locale registry helpers for Markdown Workspace packages.

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
} from "@markdown-workspace/i18n";

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
