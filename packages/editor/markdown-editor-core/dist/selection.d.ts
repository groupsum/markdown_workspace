import type { MarkdownEditorCursorPosition, MarkdownEditorEditResult, MarkdownEditorSelection } from "./types.js";
export declare function createSelection(start?: number, end?: number, direction?: MarkdownEditorSelection["direction"]): MarkdownEditorSelection;
export declare function normalizeSelection(selection: MarkdownEditorSelection, documentLength: number): MarkdownEditorSelection;
export declare function clampOffset(offset: number, documentLength: number): number;
export declare function computeCursorPosition(value: string, offset: number): MarkdownEditorCursorPosition;
export declare function replaceSelection(value: string, selection: MarkdownEditorSelection, replacement: string): MarkdownEditorEditResult;
export declare function wrapSelection(value: string, selection: MarkdownEditorSelection, prefix: string, suffix?: string): MarkdownEditorEditResult;
//# sourceMappingURL=selection.d.ts.map