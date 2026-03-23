import type { HostEditorApi, SelectionRange } from '@markdown-workspace/extension-host';
import { replaceSelection } from '@markdown-workspace/markdown-editor-core';
import type { ClientRuntimeBridge } from '../../../app/runtime/clientRuntimeTypes';
import type { ActiveEditorBridge } from '../../../features/editor/activeEditorBridge';

export function createHostEditorApi(runtime: ClientRuntimeBridge, activeEditor: ActiveEditorBridge): HostEditorApi {
  return {
    async getActiveDocument() {
      const snapshot = runtime.getSnapshot();
      const file = snapshot.app.state.activeFile;
      if (!file) return null;
      return {
        uri: `workspace://${snapshot.app.state.currentProject?.id ?? 'project'}/${file.id}`,
        language: 'markdown',
        content: file.content ?? '',
        version: String(file.lastModified),
      };
    },
    async getSelections(): Promise<readonly SelectionRange[]> {
      const handle = activeEditor.getSnapshot().handle;
      if (!handle) return [];
      const selection = handle.getSelection();
      const value = handle.getSnapshot().value;
      return [{
        start: selection.start,
        end: selection.end,
        text: value.slice(selection.start, selection.end),
      }];
    },
    async insertText(text: string): Promise<void> {
      const handle = activeEditor.getSnapshot().handle;
      if (!handle) return;
      const selection = handle.getSelection();
      handle.applyEdit(replaceSelection(handle.getSnapshot().value, selection, text));
    },
    async replaceSelections(next: string | readonly string[]): Promise<void> {
      const handle = activeEditor.getSnapshot().handle;
      if (!handle) return;
      const selection = handle.getSelection();
      const replacement = Array.isArray(next) ? next[0] ?? '' : next;
      handle.applyEdit(replaceSelection(handle.getSnapshot().value, selection, replacement));
    },
    async setDocumentContent(content: string): Promise<void> {
      const snapshot = runtime.getSnapshot();
      const file = snapshot.app.state.activeFile;
      if (!file) return;
      snapshot.app.actions.handleContentChange(content);
    },
  };
}
