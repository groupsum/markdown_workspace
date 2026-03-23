import type { CSSProperties } from "react";
import type { MarkdownEditorBuiltinCommandId, MarkdownEditorCommandOptions, MarkdownEditorHistoryState, MarkdownEditorHostEditApi, MarkdownEditorSelection, MarkdownEditorSnapshot } from "@markdown-workspace/markdown-editor-core";
import type { MarkdownEditorThemeVariables } from "./theme.js";
export interface MarkdownSourceEditorProps {
    readonly value?: string;
    readonly defaultValue?: string;
    readonly documentKey?: string | number;
    readonly onChange?: (value: string) => void;
    readonly onSelectionChange?: (selection: MarkdownEditorSelection) => void;
    readonly onCursorChange?: (line: number, column: number) => void;
    readonly onHistoryChange?: (history: MarkdownEditorHistoryState) => void;
    readonly onCommand?: (command: MarkdownEditorBuiltinCommandId) => void;
    readonly className?: string;
    readonly style?: CSSProperties;
    readonly themeStyle?: CSSProperties;
    readonly placeholder?: string;
    readonly spellCheck?: boolean;
    readonly autoFocus?: boolean;
    readonly disabled?: boolean;
    readonly showLineNumbers?: boolean;
    readonly historyLimit?: number;
    readonly textareaClassName?: string;
    readonly gutterClassName?: string;
    readonly lineNumberClassName?: string;
    readonly indentUnit?: string;
    readonly themeVariables?: MarkdownEditorThemeVariables;
}
export interface MarkdownSourceEditorHandle extends MarkdownEditorHostEditApi {
    canUndo(): boolean;
    canRedo(): boolean;
    getHistory(): MarkdownEditorHistoryState;
    setValue(value: string, options?: {
        historic?: boolean;
        selection?: MarkdownEditorSelection;
    }): void;
    executeCommand(command: MarkdownEditorBuiltinCommandId, options?: MarkdownEditorCommandOptions): MarkdownEditorSnapshot;
}
//# sourceMappingURL=types.d.ts.map