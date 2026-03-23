import type { MarkdownEditorBuiltinCommandId, MarkdownEditorCommandOptions, MarkdownEditorEditResult, MarkdownEditorSelection } from "./types.js";
export declare const BUILTIN_MARKDOWN_EDITOR_COMMANDS: readonly MarkdownEditorBuiltinCommandId[];
export declare function applyBuiltinMarkdownCommand(command: MarkdownEditorBuiltinCommandId, value: string, selection: MarkdownEditorSelection, options?: MarkdownEditorCommandOptions): MarkdownEditorEditResult;
//# sourceMappingURL=commands.d.ts.map