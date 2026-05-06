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
    case "link":
      return applyLinkCommand(value, selection, options);
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

interface MarkdownLinkRange {
  readonly start: number;
  readonly end: number;
  readonly textStart: number;
  readonly textEnd: number;
  readonly urlStart: number;
  readonly urlEnd: number;
  readonly text: string;
  readonly url: string;
}

function applyLinkCommand(
  value: string,
  selection: MarkdownEditorSelection,
  options: MarkdownEditorCommandOptions,
): MarkdownEditorEditResult {
  const normalized = normalizeSelection(selection, value.length);
  const existingLink = findEditableMarkdownLink(value, normalized);
  const url = options.linkUrl ?? existingLink?.url ?? "https://example.com";

  if (existingLink) {
    const label = options.linkText ?? existingLink.text;
    const replacement = `[${label}](${url})`;
    const nextValue = `${value.slice(0, existingLink.start)}${replacement}${value.slice(existingLink.end)}`;
    const urlStart = existingLink.start + label.length + 3;
    return {
      value: nextValue,
      selection: createSelection(urlStart, urlStart + url.length),
      changed: nextValue !== value,
    };
  }

  const selectedText = value.slice(normalized.start, normalized.end);
  const label = options.linkText ?? (selectedText || "link text");
  const replacement = `[${label}](${url})`;
  const nextValue = `${value.slice(0, normalized.start)}${replacement}${value.slice(normalized.end)}`;
  const labelStart = normalized.start + 1;
  const urlStart = normalized.start + label.length + 3;
  const shouldSelectLabel = normalized.start === normalized.end && options.linkText === undefined;

  return {
    value: nextValue,
    selection: shouldSelectLabel
      ? createSelection(labelStart, labelStart + label.length)
      : createSelection(urlStart, urlStart + url.length),
    changed: nextValue !== value,
  };
}

function findEditableMarkdownLink(value: string, selection: MarkdownEditorSelection): MarkdownLinkRange | undefined {
  const linkPattern = /\[([^\]\n]+)\]\(([^)\n]*)\)/g;
  for (const match of value.matchAll(linkPattern)) {
    const fullMatch = match[0];
    const index = match.index ?? 0;
    const text = match[1] ?? "";
    const url = match[2] ?? "";
    const textStart = index + 1;
    const textEnd = textStart + text.length;
    const urlStart = textEnd + 2;
    const urlEnd = urlStart + url.length;
    const linkEnd = index + fullMatch.length;

    if (selectionTouchesRange(selection, index, linkEnd)) {
      return {
        start: index,
        end: linkEnd,
        textStart,
        textEnd,
        urlStart,
        urlEnd,
        text,
        url,
      };
    }
  }

  return undefined;
}

function selectionTouchesRange(selection: MarkdownEditorSelection, rangeStart: number, rangeEnd: number): boolean {
  if (selection.start === selection.end) {
    return selection.start >= rangeStart && selection.start <= rangeEnd;
  }
  return selection.start < rangeEnd && selection.end > rangeStart;
}
