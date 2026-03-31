import { createSelection, normalizeSelection, replaceSelection } from "./selection.js";
import type {
  MarkdownEditorEditResult,
  MarkdownEditorSelection,
  MarkdownEditorSelectionFormatState,
} from "./types.js";

export function getSelectedLineRange(value: string, selection: MarkdownEditorSelection): {
  lineStart: number;
  lineEnd: number;
  selectedBlock: string;
  lines: string[];
  isMultiLine: boolean;
} {
  const normalized = normalizeSelection(selection, value.length);
  const lineStart = value.lastIndexOf("\n", Math.max(0, normalized.start - 1)) + 1;
  const nextBreak = value.indexOf("\n", normalized.end);
  const lineEnd = nextBreak === -1 ? value.length : nextBreak;
  const selectedBlock = value.slice(lineStart, lineEnd);
  const lines = selectedBlock.split("\n");
  const isMultiLine = lines.length > 1 || normalized.start !== normalized.end;
  return { lineStart, lineEnd, selectedBlock, lines, isMultiLine };
}

function getCurrentLineRange(value: string, offset: number): {
  lineStart: number;
  lineEnd: number;
  line: string;
} {
  const safeOffset = Math.max(0, Math.min(value.length, offset));
  const lineStart = value.lastIndexOf("\n", Math.max(0, safeOffset - 1)) + 1;
  const nextBreak = value.indexOf("\n", safeOffset);
  const lineEnd = nextBreak === -1 ? value.length : nextBreak;
  return {
    lineStart,
    lineEnd,
    line: value.slice(lineStart, lineEnd),
  };
}

export function insertText(value: string, selection: MarkdownEditorSelection, text: string): MarkdownEditorEditResult {
  return replaceSelection(value, selection, text);
}

export function indentSelection(
  value: string,
  selection: MarkdownEditorSelection,
  indentUnit = "\t",
): MarkdownEditorEditResult {
  const normalized = normalizeSelection(selection, value.length);
  const { lineStart, lineEnd, lines, isMultiLine } = getSelectedLineRange(value, normalized);

  if (!isMultiLine) {
    return insertText(value, normalized, indentUnit);
  }

  const updatedLines = lines.map((line) => `${indentUnit}${line}`);
  const nextValue = `${value.slice(0, lineStart)}${updatedLines.join("\n")}${value.slice(lineEnd)}`;
  const nextStart = normalized.start + indentUnit.length;
  const nextEnd = normalized.end + indentUnit.length * lines.length;

  return {
    value: nextValue,
    selection: createSelection(nextStart, nextEnd),
    changed: nextValue !== value,
  };
}

export function outdentSelection(
  value: string,
  selection: MarkdownEditorSelection,
  indentUnit = "\t",
): MarkdownEditorEditResult {
  const normalized = normalizeSelection(selection, value.length);
  const { lineStart, lineEnd, lines, isMultiLine } = getSelectedLineRange(value, normalized);

  const removeIndent = (line: string): { line: string; removed: number } => {
    if (line.startsWith(indentUnit)) {
      return { line: line.slice(indentUnit.length), removed: indentUnit.length };
    }
    if (indentUnit === "\t" && line.startsWith("  ")) {
      return { line: line.slice(2), removed: 2 };
    }
    return { line, removed: 0 };
  };

  if (!isMultiLine) {
    if (normalized.start === normalized.end) {
      const currentLineStart = value.lastIndexOf("\n", Math.max(0, normalized.start - 1)) + 1;
      const currentLine = value.slice(
        currentLineStart,
        value.indexOf("\n", normalized.start) === -1 ? value.length : value.indexOf("\n", normalized.start),
      );
      const { removed } = removeIndent(currentLine);
      if (removed === 0) {
        return { value, selection: normalized, changed: false };
      }
      const nextValue = `${value.slice(0, currentLineStart)}${currentLine.slice(removed)}${value.slice(currentLineStart + currentLine.length)}`;
      const nextOffset = Math.max(currentLineStart, normalized.start - removed);
      return {
        value: nextValue,
        selection: createSelection(nextOffset, nextOffset),
        changed: nextValue !== value,
      };
    }
  }

  let removedBeforeStart = 0;
  let removedTotal = 0;
  const updatedLines = lines.map((line, index) => {
    const result = removeIndent(line);
    if (index === 0) removedBeforeStart = result.removed;
    removedTotal += result.removed;
    return result.line;
  });

  const nextValue = `${value.slice(0, lineStart)}${updatedLines.join("\n")}${value.slice(lineEnd)}`;
  const nextStart = Math.max(lineStart, normalized.start - removedBeforeStart);
  const nextEnd = Math.max(nextStart, normalized.end - removedTotal);

  return {
    value: nextValue,
    selection: createSelection(nextStart, nextEnd),
    changed: nextValue !== value,
  };
}

function isTaskListLine(line: string): boolean {
  return /^\s*[-*+]\s+\[[ xX]\]\s+/.test(line) || /^\s*\d+[.)]\s+\[[ xX]\]\s+/.test(line);
}

function isBulletListLine(line: string): boolean {
  return /^\s*[-*+]\s+/.test(line) && !isTaskListLine(line);
}

function applyTaskPrefix(line: string): { line: string; added: number } {
  if (isTaskListLine(line)) {
    return { line, added: 0 };
  }

  if (/^\s*[-*+]\s+/.test(line)) {
    const updatedLine = line.replace(/^(\s*)[-*+]\s+/, "$1- [ ] ");
    return { line: updatedLine, added: updatedLine.length - line.length };
  }

  if (/^\s*\d+[.)]\s+/.test(line)) {
    const updatedLine = line.replace(/^(\s*\d+[.)])\s+/, "$1 [ ] ");
    return { line: updatedLine, added: updatedLine.length - line.length };
  }

  const updatedLine = line.replace(/^(\s*)/, "$1- [ ] ");
  return { line: updatedLine, added: updatedLine.length - line.length };
}

function applyBulletPrefix(line: string): string {
  if (line.trim().length === 0) {
    return line;
  }
  if (isTaskListLine(line)) {
    return line.replace(/^(\s*)(?:[-*+]|\d+[.)])\s+\[[ xX]\]\s+/, "$1- ");
  }
  if (/^\s*\d+[.)]\s+/.test(line)) {
    return line.replace(/^(\s*)\d+[.)]\s+/, "$1- ");
  }
  if (isBulletListLine(line)) {
    return line.replace(/^(\s*)[-*+]\s+/, "$1- ");
  }
  return line.replace(/^(\s*)/, "$1- ");
}

function removeBulletPrefix(line: string): string {
  if (line.trim().length === 0) {
    return line;
  }
  return line.replace(/^(\s*)[-*+]\s+/, "$1");
}

export function applyBulletListSelection(
  value: string,
  selection: MarkdownEditorSelection,
): MarkdownEditorEditResult {
  const normalized = normalizeSelection(selection, value.length);
  const { lineStart, lineEnd, lines } = getSelectedLineRange(value, normalized);
  const nonEmptyLines = lines.filter((line) => line.trim().length > 0);
  const shouldRemove = nonEmptyLines.length > 0 && nonEmptyLines.every((line) => isBulletListLine(line));
  const updatedLines = lines.map((line) => (shouldRemove ? removeBulletPrefix(line) : applyBulletPrefix(line)));
  const updatedBlock = updatedLines.join("\n");
  const nextValue = `${value.slice(0, lineStart)}${updatedBlock}${value.slice(lineEnd)}`;
  return {
    value: nextValue,
    selection: createSelection(lineStart, lineStart + updatedBlock.length),
    changed: nextValue !== value,
  };
}

export function applyTaskListSelection(
  value: string,
  selection: MarkdownEditorSelection,
): MarkdownEditorEditResult {
  const normalized = normalizeSelection(selection, value.length);
  const { lineStart, lineEnd, lines } = getSelectedLineRange(value, normalized);

  let addedBeforeStart = 0;
  let addedTotal = 0;
  const updatedLines = lines.map((line, index) => {
    const result = applyTaskPrefix(line);
    if (index === 0) {
      const selectionStartsInsideLine = normalized.start > lineStart || normalized.start === normalized.end;
      addedBeforeStart = selectionStartsInsideLine ? Math.max(0, result.added) : 0;
    }
    addedTotal += result.added;
    return result.line;
  });

  const updatedBlock = updatedLines.join("\n");
  const nextValue = `${value.slice(0, lineStart)}${updatedBlock}${value.slice(lineEnd)}`;
  const nextStart = Math.min(nextValue.length, Math.max(lineStart, normalized.start + addedBeforeStart));
  const nextEnd = Math.min(nextValue.length, Math.max(nextStart, normalized.end + addedTotal));

  return {
    value: nextValue,
    selection: createSelection(nextStart, nextEnd),
    changed: nextValue !== value,
  };
}

export function getListContinuationPrefix(line: string): string | null {
  const taskMatch = line.match(/^(\s*)([-*+]|\d+[.)])\s+\[[ xX]\]\s+(.*)$/);
  if (taskMatch) {
    const indent = taskMatch[1] ?? "";
    const marker = taskMatch[2] ?? "-";
    if (/^\d+[.)]$/.test(marker)) {
      const [, num, delimiter] = marker.match(/^(\d+)([.)])$/) ?? [];
      const nextNumber = String(Number(num ?? "1") + 1);
      return `${indent}${nextNumber}${delimiter} [ ] `;
    }
    return `${indent}${marker} [ ] `;
  }

  const bulletMatch = line.match(/^(\s*)([-*+])\s+(.*)$/);
  if (bulletMatch) {
    return `${bulletMatch[1] ?? ""}${bulletMatch[2] ?? "-"} `;
  }

  const orderedMatch = line.match(/^(\s*)(\d+)([.)])\s+(.*)$/);
  if (orderedMatch) {
    const indent = orderedMatch[1] ?? "";
    const nextNumber = String(Number(orderedMatch[2] ?? "1") + 1);
    const delimiter = orderedMatch[3] ?? ".";
    return `${indent}${nextNumber}${delimiter} `;
  }

  return null;
}

export function isEmptyListItemLine(line: string): boolean {
  return (
    /^\s*[-*+](?:\s+)?$/.test(line) ||
    /^\s*[-*+]\s+\[[ xX]\]\s*$/.test(line) ||
    /^\s*\d+[.)](?:\s+)?$/.test(line) ||
    /^\s*\d+[.)]\s+\[[ xX]\]\s*$/.test(line)
  );
}

export function insertListContinuation(
  value: string,
  selection: MarkdownEditorSelection,
): MarkdownEditorEditResult {
  const normalized = normalizeSelection(selection, value.length);
  const { lineStart, lineEnd, line } = getCurrentLineRange(value, normalized.end);
  const prefix = getListContinuationPrefix(line);

  if (!prefix) {
    return replaceSelection(value, normalized, "\n");
  }

  if (isEmptyListItemLine(line)) {
    const indent = line.match(/^(\s*)/)?.[1] ?? "";
    const nextValue = `${value.slice(0, lineStart)}${indent}${value.slice(lineEnd)}`;
    const nextOffset = lineStart + indent.length;
    return {
      value: nextValue,
      selection: createSelection(nextOffset, nextOffset),
      changed: nextValue !== value,
    };
  }

  return replaceSelection(value, normalized, `\n${prefix}`);
}

function isSelectionWrappedBy(
  value: string,
  selection: MarkdownEditorSelection,
  prefix: string,
  suffix = prefix,
): boolean {
  const normalized = normalizeSelection(selection, value.length);
  if (normalized.start === normalized.end) {
    return false;
  }
  const before = value.slice(Math.max(0, normalized.start - prefix.length), normalized.start);
  const after = value.slice(normalized.end, normalized.end + suffix.length);
  return before === prefix && after === suffix;
}

function isCursorWithinWrapped(
  value: string,
  offset: number,
  prefix: string,
  suffix = prefix,
): boolean {
  const safeOffset = Math.max(0, Math.min(value.length, offset));
  const prefixIndex = value.lastIndexOf(prefix, safeOffset);
  if (prefixIndex === -1) return false;
  const suffixIndex = value.indexOf(suffix, prefixIndex + prefix.length);
  if (suffixIndex === -1) return false;
  return safeOffset >= prefixIndex + prefix.length && safeOffset <= suffixIndex;
}

export function computeSelectionFormatState(
  value: string,
  selection: MarkdownEditorSelection,
): MarkdownEditorSelectionFormatState {
  const normalized = normalizeSelection(selection, value.length);
  const currentLine = getCurrentLineRange(value, normalized.start).line;
  const bold = normalized.start === normalized.end
    ? isCursorWithinWrapped(value, normalized.start, "**")
    : isSelectionWrappedBy(value, normalized, "**");
  const italic = normalized.start === normalized.end
    ? isCursorWithinWrapped(value, normalized.start, "_")
    : isSelectionWrappedBy(value, normalized, "_");
  const strikethrough = normalized.start === normalized.end
    ? isCursorWithinWrapped(value, normalized.start, "~~")
    : isSelectionWrappedBy(value, normalized, "~~");
  return {
    bold,
    italic,
    strikethrough,
    bulletList: isBulletListLine(currentLine),
    taskList: isTaskListLine(currentLine),
  };
}
