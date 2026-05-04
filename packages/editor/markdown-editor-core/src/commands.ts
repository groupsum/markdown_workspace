import { createSelection, normalizeSelection, wrapSelection } from "./selection.js";
import { applyBulletListSelection, applyTaskListSelection, indentSelection, outdentSelection } from "./transforms.js";
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
  "bullet-list",
  "task-list",
  "link",
  "front-matter",
  "footnote",
  "inline-math",
  "block-math",
  "superscript",
  "subscript",
  "citation",
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
    case "bullet-list":
      return applyBulletListSelection(value, selection);
    case "task-list":
      return applyTaskListSelection(value, selection);
    case "link": {
      const normalized = normalizeSelection(selection, value.length);
      const selectedText = value.slice(normalized.start, normalized.end) || "link text";
      const url = options.linkUrl ?? "https://example.com";
      const replacement = `[${selectedText}](${url})`;
      const nextValue = `${value.slice(0, normalized.start)}${replacement}${value.slice(normalized.end)}`;
      const urlStart = normalized.start + selectedText.length + 3;
      return {
        value: nextValue,
        selection: createSelection(urlStart, urlStart + url.length),
        changed: nextValue !== value,
      };
    }
    case "front-matter": {
      const frontMatter = "---\ntitle: \n---\n\n";
      if (String(value).startsWith("---\n")) {
        return { value, selection, changed: false };
      }
      return {
        value: `${frontMatter}${value}`,
        selection: {
          start: 10,
          end: 10,
          direction: 'none',
        },
        changed: true,
      };
    }
    case "footnote":
      return wrapSelection(value, selection, "[^1]", "");
    case "inline-math":
      return wrapSelection(value, selection, "$", "$");
    case "block-math":
      return wrapSelection(value, selection, "$$\n", "\n$$");
    case "superscript":
      return wrapSelection(value, selection, "^", "^");
    case "subscript":
      return wrapSelection(value, selection, "~", "~");
    case "citation":
      return wrapSelection(value, selection, "[@", "]");
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
