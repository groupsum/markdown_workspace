import type { ExtensionCapability } from "./capabilities.js";
import type { ExtensionCompatibility } from "./compatibility.js";
import type { I18nLabel } from "./i18n.js";
import type { ExtensionIcon } from "./icon.js";
import type { ExtensionIntegrity } from "./integrity.js";
import type { ExtensionSupportDeclaration } from "./support.js";
export declare const EXTENSION_CATALOG_SCHEMA_VERSION: 1;
export interface ExtensionCatalogArtifactUrls {
    readonly manifest: string;
    readonly signedManifest: string;
    readonly module: string;
    readonly integrity?: string;
}
export interface ExtensionCatalogEntryIntegrity {
    readonly manifest?: ExtensionIntegrity;
    readonly module: ExtensionIntegrity;
}
export interface ExtensionCatalogEntry {
    readonly entryId: string;
    readonly extensionId: string;
    readonly packageName: string;
    readonly version: string;
    readonly displayName: I18nLabel;
    readonly description: I18nLabel;
    readonly publisher?: string;
    readonly icon?: ExtensionIcon;
    readonly categories?: readonly string[];
    readonly keywords?: readonly string[];
    readonly capabilities: readonly ExtensionCapability[];
    readonly compatibility: ExtensionCompatibility;
    readonly supportedLocales?: readonly string[];
    readonly urls: ExtensionCatalogArtifactUrls;
    readonly integrity: ExtensionCatalogEntryIntegrity;
    readonly support?: ExtensionSupportDeclaration;
}
export interface ExtensionCatalogDocument {
    readonly schemaVersion: typeof EXTENSION_CATALOG_SCHEMA_VERSION | number;
    readonly generatedAt: string;
    readonly publisher?: string;
    readonly baseUrl?: string;
    readonly extensions: readonly ExtensionCatalogEntry[];
}
//# sourceMappingURL=catalog.d.ts.map