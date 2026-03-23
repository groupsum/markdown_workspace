export type StoreListener = () => void;

export interface ObservableStore<TSnapshot> {
  getSnapshot(): TSnapshot;
  subscribe(listener: StoreListener): () => void;
}

export function createStoreEmitter() {
  const listeners = new Set<StoreListener>();

  return {
    emit(): void {
      for (const listener of Array.from(listeners)) {
        listener();
      }
    },
    subscribe(listener: StoreListener): () => void {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
