import type { MarkdownWorkspaceExtension } from "@mdwrk/extension-host";
import type { RegisteredRuntimeExtensionCatalogEntry } from "./types.js";
export interface ExtensionLoader {
    load(entry: RegisteredRuntimeExtensionCatalogEntry): Promise<MarkdownWorkspaceExtension>;
}
export declare function createExtensionLoader(): ExtensionLoader;
//# sourceMappingURL=loader.d.ts.map