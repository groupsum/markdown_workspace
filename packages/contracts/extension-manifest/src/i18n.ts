import type { ExtensionIntegrity } from "./integrity.js";

export interface I18nLabel {
  readonly defaultMessage: string;
  readonly description?: string;
  readonly key?: string;
  readonly values?: Readonly<Record<string, string | number | boolean | null>>;
}

export interface ExtensionLocaleCatalogReference {
  readonly locale: string;
  readonly path: string;
  readonly integrity?: ExtensionIntegrity;
}

export interface ExtensionI18nDefinition {
  readonly defaultLocale: string;
  readonly supportedLocales: readonly string[];
  readonly catalogs?: readonly ExtensionLocaleCatalogReference[];
}
