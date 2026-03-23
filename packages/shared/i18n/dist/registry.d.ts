import type { LocaleCatalog, LocaleRegistryOptions, MessageDescriptor, MessageValue } from "./types.js";
export interface LocaleRegistry {
    getLocale(): string;
    setLocale(locale: string): void;
    registerCatalog(catalog: LocaleCatalog): void;
    hasMessage(key: string, locale?: string): boolean;
    resolve(descriptor: string | MessageDescriptor, values?: Readonly<Record<string, MessageValue>>): string;
}
export declare function createLocaleRegistry(options?: LocaleRegistryOptions): LocaleRegistry;
//# sourceMappingURL=registry.d.ts.map