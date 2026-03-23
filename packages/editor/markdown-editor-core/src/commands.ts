import { wrapSelection } from "./selection.js";
import { indentSelection, outdentSelection } from "./transforms.js";
import type {
  MarkdownEditorBuiltinCommandId,
  MarkdownEditorCommandOptions,
  MarkdownEditorEditResult,
  MarkdownEditorSelection,
} from "./types.js";

export const BUILTIN_MARKDOWN_EDITOR_COMMANDS: readonly MarkdownEditorBuiltinCommandId[] = [
  "bold",
  "italic",
  "strikethrough",
  "indent",
  "outdent",
  "undo",
  "redo",
  "insert-tab",
] as const;

export function applyBuiltinMarkdownCommand(
  command: MarkdownEditorBuiltinCommandId,
  value: string,
  selection: MarkdownEditorSelection,
  options: MarkdownEditorCommandOptions = {},
): MarkdownEditorEditResult {
  switch (command) {
    case "bold":
      return wrapSelection(value, selection, "**", "**");
    case "italic":
      return wrapSelection(value, selection, "_", "_");
    case "strikethrough":
      return wrapSelection(value, selection, "~~", "~~");
    case "indent":
    case "insert-tab":
      return indentSelection(value, selection, options.indentUnit ?? "\t");
    case "outdent":
      return outdentSelection(value, selection, options.indentUnit ?? "\t");
    case "undo":
    case "redo":
      return {
        value,
        selection,
        changed: false,
      };
    default: {
      const exhaustiveCheck: never = command;
      throw new Error(`Unsupported markdown editor command: ${String(exhaustiveCheck)}`);
    }
  }
}
