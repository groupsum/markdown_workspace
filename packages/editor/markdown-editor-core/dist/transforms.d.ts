import type { MarkdownEditorEditResult, MarkdownEditorSelection } from "./types.js";
export declare function insertText(value: string, selection: MarkdownEditorSelection, text: string): MarkdownEditorEditResult;
export declare function indentSelection(value: string, selection: MarkdownEditorSelection, indentUnit?: string): MarkdownEditorEditResult;
export declare function outdentSelection(value: string, selection: MarkdownEditorSelection, indentUnit?: string): MarkdownEditorEditResult;
//# sourceMappingURL=transforms.d.ts.map