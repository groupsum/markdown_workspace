import type { ExtensionConfigurationStore } from "@markdown-workspace/extension-host";
import type { ExtensionRuntimeStorage } from "./types.js";
export declare const EXTENSION_ENABLED_STATE_KEY_SUFFIX: "enabled";
export declare const EXTENSION_CONFIG_KEY_SEGMENT: "config";
export declare const EXTENSION_INSTALL_SEGMENT: "install";
export declare const EXTENSION_INSTALL_INDEX_KEY: "ext:install:index";
export declare const getExtensionEnabledStateKey: (extensionId: string) => string;
export declare const getExtensionConfigKey: (extensionId: string, key: string) => string;
export declare const getInstalledExtensionRecordKey: (extensionId: string) => string;
export declare const getInstalledExtensionModuleKey: (extensionId: string) => string;
export declare function createExtensionConfigurationStore(extensionId: string, storage: ExtensionRuntimeStorage): ExtensionConfigurationStore;
export declare function createInMemoryExtensionRuntimeStorage(seed?: Readonly<Record<string, unknown>>): ExtensionRuntimeStorage;
//# sourceMappingURL=storage.d.ts.map