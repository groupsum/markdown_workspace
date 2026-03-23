import type {
  MarkdownEditorCursorPosition,
  MarkdownEditorEditResult,
  MarkdownEditorSelection,
} from "./types.js";

export function createSelection(start = 0, end = start, direction: MarkdownEditorSelection["direction"] = "none"): MarkdownEditorSelection {
  return { start, end, direction };
}

export function normalizeSelection(selection: MarkdownEditorSelection, documentLength: number): MarkdownEditorSelection {
  const start = clampOffset(selection.start, documentLength);
  const end = clampOffset(selection.end, documentLength);
  if (start <= end) return { start, end, direction: selection.direction ?? "none" };
  return { start: end, end: start, direction: selection.direction ?? "none" };
}

export function clampOffset(offset: number, documentLength: number): number {
  if (Number.isNaN(offset)) return 0;
  return Math.max(0, Math.min(documentLength, offset));
}

export function computeCursorPosition(value: string, offset: number): MarkdownEditorCursorPosition {
  const safeOffset = clampOffset(offset, value.length);
  const textBeforeCursor = value.slice(0, safeOffset);
  const lines = textBeforeCursor.split("\n");
  return {
    offset: safeOffset,
    line: lines.length,
    column: lines[lines.length - 1].length + 1,
  };
}

export function replaceSelection(
  value: string,
  selection: MarkdownEditorSelection,
  replacement: string,
): MarkdownEditorEditResult {
  const normalized = normalizeSelection(selection, value.length);
  const nextValue = `${value.slice(0, normalized.start)}${replacement}${value.slice(normalized.end)}`;
  const cursor = normalized.start + replacement.length;
  return {
    value: nextValue,
    selection: createSelection(cursor, cursor),
    changed: nextValue !== value,
  };
}

export function wrapSelection(
  value: string,
  selection: MarkdownEditorSelection,
  prefix: string,
  suffix = prefix,
): MarkdownEditorEditResult {
  const normalized = normalizeSelection(selection, value.length);
  const selectedText = value.slice(normalized.start, normalized.end);
  const replacement = `${prefix}${selectedText}${suffix}`;
  const nextValue = `${value.slice(0, normalized.start)}${replacement}${value.slice(normalized.end)}`;

  const hasSelection = normalized.start !== normalized.end;
  const nextSelection = hasSelection
    ? createSelection(normalized.start + prefix.length, normalized.end + prefix.length)
    : createSelection(normalized.start + prefix.length, normalized.start + prefix.length);

  return {
    value: nextValue,
    selection: nextSelection,
    changed: nextValue !== value,
  };
}
