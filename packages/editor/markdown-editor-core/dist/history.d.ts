import type { MarkdownEditorHistoryState, MarkdownEditorSelection, MarkdownEditorSnapshot } from "./types.js";
export declare function createEditorSnapshot(value?: string, selection?: MarkdownEditorSelection): MarkdownEditorSnapshot;
export declare function createHistoryState(initialValue?: string, selection?: MarkdownEditorSelection, limit?: number): MarkdownEditorHistoryState;
export declare function resetHistoryState(value?: string, selection?: MarkdownEditorSelection, limit?: number): MarkdownEditorHistoryState;
export declare function pushHistoryEntry(history: MarkdownEditorHistoryState, nextValue: string, selection?: MarkdownEditorSelection): MarkdownEditorHistoryState;
export declare function replaceHistoryPresent(history: MarkdownEditorHistoryState, nextValue: string, selection?: MarkdownEditorSelection): MarkdownEditorHistoryState;
export declare function canUndoHistory(history: MarkdownEditorHistoryState): boolean;
export declare function canRedoHistory(history: MarkdownEditorHistoryState): boolean;
export declare function undoHistory(history: MarkdownEditorHistoryState): MarkdownEditorHistoryState;
export declare function redoHistory(history: MarkdownEditorHistoryState): MarkdownEditorHistoryState;
//# sourceMappingURL=history.d.ts.map