import type { DiagnosticRecord } from '@markdown-workspace/extension-host';
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

  const snapshot = (): ClientDiagnosticsSnapshot => ({
    records: Object.freeze(Object.fromEntries(Array.from(records.entries()).map(([key, value]) => [key, Object.freeze([...value])])))
  });

  return {
    getSnapshot(): ClientDiagnosticsSnapshot {
      return snapshot();
    },
    subscribe: emitter.subscribe,
    async publish(extensionId: string, record: DiagnosticRecord): Promise<void> {
      const bucket = records.get(extensionId) ?? [];
      bucket.push(record);
      records.set(extensionId, bucket);
      emitter.emit();
    },
    async clear(extensionId: string): Promise<void> {
      records.delete(extensionId);
      emitter.emit();
    },
    list(extensionId?: string): readonly DiagnosticRecord[] {
      if (extensionId) {
        return records.get(extensionId) ?? [];
      }
      return Array.from(records.values()).flat();
    },
  };
}
