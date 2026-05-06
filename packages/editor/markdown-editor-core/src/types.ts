export type MarkdownEditorSelectionDirection = "forward" | "backward" | "none";

export interface MarkdownEditorSelection {
  readonly start: number;
  readonly end: number;
  readonly direction?: MarkdownEditorSelectionDirection;
}

export interface MarkdownEditorCursorPosition {
  readonly offset: number;
  readonly line: number;
  readonly column: number;
}

export interface MarkdownEditorSnapshot {
  readonly value: string;
  readonly selection: MarkdownEditorSelection;
}

export interface MarkdownEditorHistoryState {
  readonly past: readonly MarkdownEditorSnapshot[];
  readonly present: MarkdownEditorSnapshot;
  readonly future: readonly MarkdownEditorSnapshot[];
  readonly limit: number;
}

export type MarkdownEditorBuiltinCommandId =
  | "bold"
  | "italic"
  | "strikethrough"
  | "bullet-list"
  | "task-list"
  | "link"
  | "front-matter"
  | "footnote"
  | "inline-math"
  | "block-math"
  | "superscript"
  | "subscript"
  | "citation"
  | "indent"
  | "outdent"
  | "undo"
  | "redo"
  | "insert-tab";

export interface MarkdownEditorCommandOptions {
  readonly indentUnit?: string;
  readonly linkText?: string;
  readonly linkUrl?: string;
}

export interface MarkdownEditorEditResult {
  readonly value: string;
  readonly selection: MarkdownEditorSelection;
  readonly changed: boolean;
}

export interface MarkdownEditorSelectionFormatState {
  readonly bold: boolean;
  readonly italic: boolean;
  readonly strikethrough: boolean;
  readonly bulletList: boolean;
  readonly taskList: boolean;
}

export interface MarkdownEditorHistoryStatus {
  readonly canUndo: boolean;
  readonly canRedo: boolean;
}

export interface MarkdownEditorHostEditApi {
  getSnapshot(): MarkdownEditorSnapshot;
  getSelection(): MarkdownEditorSelection;
  setSelection(selection: MarkdownEditorSelection): void;
  applyEdit(result: MarkdownEditorEditResult, options?: { historic?: boolean }): void;
  executeCommand(
    command: MarkdownEditorBuiltinCommandId,
    options?: MarkdownEditorCommandOptions,
  ): MarkdownEditorSnapshot;
  undo(): void;
  redo(): void;
  focus(): void;
}
