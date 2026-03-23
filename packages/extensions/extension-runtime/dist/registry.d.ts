import type { Disposable } from "@markdown-workspace/extension-host";
import type { BundledExtensionCatalogEntry, InstalledExtensionCatalogEntry, RegisteredRuntimeExtensionCatalogEntry, RuntimeExtensionCatalogEntry } from "./types.js";
export interface ExtensionRegistry {
    register(entry: RuntimeExtensionCatalogEntry): Disposable;
    registerBundled(entry: BundledExtensionCatalogEntry): Disposable;
    registerInstalled(entry: InstalledExtensionCatalogEntry): Disposable;
    unregister(id: string): void;
    list(): readonly RegisteredRuntimeExtensionCatalogEntry[];
    get(id: string): RegisteredRuntimeExtensionCatalogEntry | undefined;
}
export declare function createExtensionRegistry(): ExtensionRegistry;
//# sourceMappingURL=registry.d.ts.map