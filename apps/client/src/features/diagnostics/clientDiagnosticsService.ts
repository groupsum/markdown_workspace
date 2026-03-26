import type { DiagnosticRecord } from '@mdwrk/extension-host';
import { createStoreEmitter, type ObservableStore } from '../common/observable';

export interface ClientDiagnosticsSnapshot {
  readonly records: Readonly<Record<string, readonly DiagnosticRecord[]>>;
}

export interface ClientDiagnosticsService extends ObservableStore<ClientDiagnosticsSnapshot> {
  publish(extensionId: string, record: DiagnosticRecord): Promise<void>;
  clear(extensionId: string): Promise<void>;
  list(extensionId?: string): readonly DiagnosticRecord[];
}

export function createClientDiagnosticsService(): ClientDiagnosticsService {
  const records = new Map<string, DiagnosticRecord[]>();
  const emitter = createStoreEmitter();
  let cachedSnapshot: ClientDiagnosticsSnapshot | null = null;

  const snapshot = (): ClientDiagnosticsSnapshot => ({
    records: Object.freeze(Object.fromEntries(Array.from(records.entries()).map(([key, value]) => [key, Object.freeze([...value])])))
  });

  const emitChange = (): void => {
    cachedSnapshot = null;
    emitter.emit();
  };

  return {
    getSnapshot(): ClientDiagnosticsSnapshot {
      if (!cachedSnapshot) {
        cachedSnapshot = snapshot();
      }
      return cachedSnapshot;
    },
    subscribe: emitter.subscribe,
    async publish(extensionId: string, record: DiagnosticRecord): Promise<void> {
      const bucket = records.get(extensionId) ?? [];
      bucket.push(record);
      records.set(extensionId, bucket);
      emitChange();
    },
    async clear(extensionId: string): Promise<void> {
      records.delete(extensionId);
      emitChange();
    },
    list(extensionId?: string): readonly DiagnosticRecord[] {
      if (extensionId) {
        return records.get(extensionId) ?? [];
      }
      return Array.from(records.values()).flat();
    },
  };
}
