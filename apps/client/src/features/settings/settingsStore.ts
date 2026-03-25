import type { Disposable, JsonValue } from '@mdwrk/extension-host';
import { storage } from '../../../services/storage';

export interface HostSettingsStore {
  get<T = unknown>(key: string): Promise<T | null>;
  set<T = unknown>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  watch<T = unknown>(key: string, listener: (value: T | null) => void): Disposable;
}

export function createHostSettingsStore(): HostSettingsStore {
  const listeners = new Map<string, Set<(value: unknown | null) => void>>();

  const emit = (key: string, value: unknown | null) => {
    for (const listener of Array.from(listeners.get(key) ?? [])) {
      listener(value);
    }
  };

  return {
    async get<T = unknown>(key: string): Promise<T | null> {
      return await storage.getSetting<T>(key);
    },
    async set<T = unknown>(key: string, value: T): Promise<void> {
      await storage.setSetting(key, value);
      emit(key, value ?? null);
    },
    async remove(key: string): Promise<void> {
      await storage.setSetting<JsonValue | null>(key, null);
      emit(key, null);
    },
    watch<T = unknown>(key: string, listener: (value: T | null) => void): Disposable {
      const bucket = listeners.get(key) ?? new Set();
      bucket.add(listener as (value: unknown | null) => void);
      listeners.set(key, bucket);
      return {
        dispose(): void {
          const activeBucket = listeners.get(key);
          if (!activeBucket) return;
          activeBucket.delete(listener as (value: unknown | null) => void);
          if (activeBucket.size === 0) {
            listeners.delete(key);
          }
        },
      };
    },
  };
}
