import type { MarkdownEditorEditResult, MarkdownEditorSelection, MarkdownEditorSelectionFormatState } from "./types.js";
export declare function getSelectedLineRange(value: string, selection: MarkdownEditorSelection): {
    lineStart: number;
    lineEnd: number;
    selectedBlock: string;
    lines: string[];
    isMultiLine: boolean;
};
export declare function insertText(value: string, selection: MarkdownEditorSelection, text: string): MarkdownEditorEditResult;
export declare function indentSelection(value: string, selection: MarkdownEditorSelection, indentUnit?: string): MarkdownEditorEditResult;
export declare function outdentSelection(value: string, selection: MarkdownEditorSelection, indentUnit?: string): MarkdownEditorEditResult;
export declare function applyBulletListSelection(value: string, selection: MarkdownEditorSelection): MarkdownEditorEditResult;
export declare function applyTaskListSelection(value: string, selection: MarkdownEditorSelection): MarkdownEditorEditResult;
export declare function getListContinuationPrefix(line: string): string | null;
export declare function isEmptyListItemLine(line: string): boolean;
export declare function insertListContinuation(value: string, selection: MarkdownEditorSelection): MarkdownEditorEditResult;
export declare function computeSelectionFormatState(value: string, selection: MarkdownEditorSelection): MarkdownEditorSelectionFormatState;
//# sourceMappingURL=transforms.d.ts.map