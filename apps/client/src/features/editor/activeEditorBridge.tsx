import React from 'react';
import type { MarkdownSourceEditorHandle } from '@mdwrk/markdown-editor-react';

export interface ActiveEditorSnapshot {
  readonly fileId: string | null;
  readonly handle: MarkdownSourceEditorHandle | null;
}

export interface ActiveEditorBridge {
  getSnapshot(): ActiveEditorSnapshot;
  setActiveEditor(fileId: string, handle: MarkdownSourceEditorHandle | null): void;
  clearActiveEditor(fileId?: string): void;
  subscribe(listener: () => void): () => void;
}

export function createActiveEditorBridge(): ActiveEditorBridge {
  let snapshot: ActiveEditorSnapshot = { fileId: null, handle: null };
  const listeners = new Set<() => void>();

  const emit = () => {
    for (const listener of Array.from(listeners)) {
      listener();
    }
  };

  return {
    getSnapshot(): ActiveEditorSnapshot {
      return snapshot;
    },
    setActiveEditor(fileId: string, handle: MarkdownSourceEditorHandle | null): void {
      snapshot = { fileId, handle };
      emit();
    },
    clearActiveEditor(fileId?: string): void {
      if (fileId && snapshot.fileId && snapshot.fileId !== fileId) {
        return;
      }
      snapshot = { fileId: null, handle: null };
      emit();
    },
    subscribe(listener: () => void): () => void {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

const ActiveEditorBridgeContext = React.createContext<ActiveEditorBridge | null>(null);

export const ActiveEditorBridgeProvider: React.FC<React.PropsWithChildren<{ bridge: ActiveEditorBridge }>> = ({ bridge, children }) => (
  <ActiveEditorBridgeContext.Provider value={bridge}>{children}</ActiveEditorBridgeContext.Provider>
);

export const useActiveEditorBridge = (): ActiveEditorBridge | null => React.useContext(ActiveEditorBridgeContext);
