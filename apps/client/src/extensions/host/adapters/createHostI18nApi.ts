import type {
  Disposable,
  ExtensionLocaleCatalog,
  ExtensionLocaleCatalogLoader,
  HostI18nApi,
} from '@mdwrk/extension-host';
import type { ClientI18nService } from '../../../features/i18n/clientI18nService';

function qualifyMessageKey(extensionId: string, key: string): string {
  return key.startsWith(`${extensionId}.`) ? key : `${extensionId}.${key}`;
}

export function createHostI18nApi(i18n: ClientI18nService): HostI18nApi {
  return {
    async getLocale(): Promise<string> {
      return i18n.getLocale();
    },
    async setLocale(locale: string): Promise<void> {
      i18n.setLocale(locale);
      await i18n.ensureLocale(locale);
    },
    async ensureLocale(locale?: string): Promise<void> {
      await i18n.ensureLocale(locale);
    },
    format(label) {
      return i18n.format(label);
    },
    registerCatalog(extensionId: string, catalog: ExtensionLocaleCatalog): Disposable {
      i18n.registerCatalog({
        locale: catalog.locale,
        messages: Object.fromEntries(
          Object.entries(catalog.messages).map(([key, value]) => [
            qualifyMessageKey(extensionId, key),
            value,
          ]),
        ),
      });
      return {
        dispose(): void {
          // catalogs are append-only in the current client host.
        },
      };
    },
    registerCatalogLoader(extensionId: string, loader: ExtensionLocaleCatalogLoader): Disposable {
      const dispose = i18n.registerCatalogLoader(extensionId, {
        defaultLocale: loader.defaultLocale,
        fallbackLocale: loader.fallbackLocale,
        loaders: Object.fromEntries(
          Object.entries(loader.loaders).map(([locale, loadCatalog]) => [
            locale,
            async () => {
              const catalog = await loadCatalog();
              return {
                locale: catalog.locale,
                messages: Object.fromEntries(
                  Object.entries(catalog.messages).map(([key, value]) => [
                    qualifyMessageKey(extensionId, key),
                    value,
                  ]),
                ),
              };
            },
          ]),
        ),
      });
      return { dispose };
    },
  };
}
