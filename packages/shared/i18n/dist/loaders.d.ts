import type { LocaleCatalog, LocaleCatalogMessages } from "./types.js";
export type LocaleCatalogLoader = () => LocaleCatalog | Promise<LocaleCatalog>;
export type LocaleCatalogLoaderRecord = Readonly<Record<string, LocaleCatalogLoader>>;
export interface LocaleCatalogLoaderDefinition {
    readonly defaultLocale?: string;
    readonly fallbackLocale?: string;
    readonly loaders: LocaleCatalogLoaderRecord;
}
export interface LoadLocaleCatalogsOptions {
    readonly locale: string;
    readonly defaultLocale?: string;
    readonly fallbackLocale?: string;
    readonly loaders: LocaleCatalogLoaderRecord;
    readonly namespace?: string;
}
export declare function createLocaleFallbackChain(locale: string, options?: {
    readonly defaultLocale?: string;
    readonly fallbackLocale?: string;
}): readonly string[];
export declare function createNamespacedLocaleCatalog(namespace: string, locale: string, messages: LocaleCatalogMessages): LocaleCatalog;
export declare function loadLocaleCatalogs(options: LoadLocaleCatalogsOptions): Promise<readonly LocaleCatalog[]>;
//# sourceMappingURL=loaders.d.ts.map