export const EXTENSION_ENABLED_STATE_KEY_SUFFIX = "enabled";
export const EXTENSION_CONFIG_KEY_SEGMENT = "config";
export const EXTENSION_INSTALL_SEGMENT = "install";
export const EXTENSION_INSTALL_INDEX_KEY = `ext:${EXTENSION_INSTALL_SEGMENT}:index`;
export const getExtensionEnabledStateKey = (extensionId) => `ext:${extensionId}:${EXTENSION_ENABLED_STATE_KEY_SUFFIX}`;
export const getExtensionConfigKey = (extensionId, key) => `ext:${extensionId}:${EXTENSION_CONFIG_KEY_SEGMENT}:${key}`;
export const getInstalledExtensionRecordKey = (extensionId) => `ext:${extensionId}:${EXTENSION_INSTALL_SEGMENT}:record`;
export const getInstalledExtensionModuleKey = (extensionId) => `ext:${extensionId}:${EXTENSION_INSTALL_SEGMENT}:module`;
export function createExtensionConfigurationStore(extensionId, storage) {
    return {
        async get(key) {
            return await storage.get(getExtensionConfigKey(extensionId, key));
        },
        async set(key, value) {
            await storage.set(getExtensionConfigKey(extensionId, key), value);
        },
        async remove(key) {
            await storage.remove(getExtensionConfigKey(extensionId, key));
        },
        watch(key, listener) {
            return storage.watch(getExtensionConfigKey(extensionId, key), listener);
        },
    };
}
export function createInMemoryExtensionRuntimeStorage(seed) {
    const values = new Map(Object.entries(seed ?? {}));
    const listeners = new Map();
    const emit = (key, value) => {
        for (const listener of Array.from(listeners.get(key) ?? [])) {
            listener(value);
        }
    };
    return {
        async get(key) {
            return (values.has(key) ? values.get(key) : null);
        },
        async set(key, value) {
            values.set(key, value);
            emit(key, value ?? null);
        },
        async remove(key) {
            values.delete(key);
            emit(key, null);
        },
        watch(key, listener) {
            const bucket = listeners.get(key) ?? new Set();
            bucket.add(listener);
            listeners.set(key, bucket);
            return {
                dispose() {
                    const active = listeners.get(key);
                    if (!active)
                        return;
                    active.delete(listener);
                    if (active.size === 0) {
                        listeners.delete(key);
                    }
                },
            };
        },
    };
}
//# sourceMappingURL=storage.js.map