import type { Disposable, ExtensionConfigurationStore } from "@mdwrk/extension-host";
import type { ExtensionRuntimeStorage } from "./types.js";

export const EXTENSION_ENABLED_STATE_KEY_SUFFIX = "enabled" as const;
export const EXTENSION_CONFIG_KEY_SEGMENT = "config" as const;
export const EXTENSION_INSTALL_SEGMENT = "install" as const;
export const EXTENSION_INSTALL_INDEX_KEY = `ext:${EXTENSION_INSTALL_SEGMENT}:index` as const;

export const getExtensionEnabledStateKey = (extensionId: string): string => `ext:${extensionId}:${EXTENSION_ENABLED_STATE_KEY_SUFFIX}`;
export const getExtensionConfigKey = (extensionId: string, key: string): string => `ext:${extensionId}:${EXTENSION_CONFIG_KEY_SEGMENT}:${key}`;
export const getInstalledExtensionRecordKey = (extensionId: string): string => `ext:${extensionId}:${EXTENSION_INSTALL_SEGMENT}:record`;
export const getInstalledExtensionModuleKey = (extensionId: string): string => `ext:${extensionId}:${EXTENSION_INSTALL_SEGMENT}:module`;

export function createExtensionConfigurationStore(
  extensionId: string,
  storage: ExtensionRuntimeStorage,
): ExtensionConfigurationStore {
  return {
    async get<T = unknown>(key: string): Promise<T | null> {
      return await storage.get<T>(getExtensionConfigKey(extensionId, key));
    },
    async set<T = unknown>(key: string, value: T): Promise<void> {
      await storage.set(getExtensionConfigKey(extensionId, key), value);
    },
    async remove(key: string): Promise<void> {
      await storage.remove(getExtensionConfigKey(extensionId, key));
    },
    watch<T = unknown>(key: string, listener: (value: T | null) => void): Disposable {
      return storage.watch<T>(getExtensionConfigKey(extensionId, key), listener);
    },
  };
}

export function createInMemoryExtensionRuntimeStorage(seed?: Readonly<Record<string, unknown>>): ExtensionRuntimeStorage {
  const values = new Map<string, unknown>(Object.entries(seed ?? {}));
  const listeners = new Map<string, Set<(value: unknown | null) => void>>();

  const emit = (key: string, value: unknown | null) => {
    for (const listener of Array.from(listeners.get(key) ?? [])) {
      listener(value);
    }
  };

  return {
    async get<T = unknown>(key: string): Promise<T | null> {
      return (values.has(key) ? values.get(key) : null) as T | null;
    },
    async set<T = unknown>(key: string, value: T): Promise<void> {
      values.set(key, value);
      emit(key, value ?? null);
    },
    async remove(key: string): Promise<void> {
      values.delete(key);
      emit(key, null);
    },
    watch<T = unknown>(key: string, listener: (value: T | null) => void): Disposable {
      const bucket = listeners.get(key) ?? new Set();
      bucket.add(listener as (value: unknown | null) => void);
      listeners.set(key, bucket);
      return {
        dispose(): void {
          const active = listeners.get(key);
          if (!active) return;
          active.delete(listener as (value: unknown | null) => void);
          if (active.size === 0) {
            listeners.delete(key);
          }
        },
      };
    },
  };
}
