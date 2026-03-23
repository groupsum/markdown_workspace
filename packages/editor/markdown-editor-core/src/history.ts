import { createSelection, normalizeSelection } from "./selection.js";
import type { MarkdownEditorHistoryState, MarkdownEditorSelection, MarkdownEditorSnapshot } from "./types.js";

export function createEditorSnapshot(value = "", selection: MarkdownEditorSelection = createSelection(value.length)): MarkdownEditorSnapshot {
  return {
    value,
    selection: normalizeSelection(selection, value.length),
  };
}

export function createHistoryState(
  initialValue = "",
  selection: MarkdownEditorSelection = createSelection(initialValue.length),
  limit = 100,
): MarkdownEditorHistoryState {
  return {
    past: [],
    present: createEditorSnapshot(initialValue, selection),
    future: [],
    limit,
  };
}

export function resetHistoryState(
  value = "",
  selection: MarkdownEditorSelection = createSelection(value.length),
  limit = 100,
): MarkdownEditorHistoryState {
  return createHistoryState(value, selection, limit);
}

export function pushHistoryEntry(
  history: MarkdownEditorHistoryState,
  nextValue: string,
  selection: MarkdownEditorSelection = createSelection(nextValue.length),
): MarkdownEditorHistoryState {
  const nextPresent = createEditorSnapshot(nextValue, selection);
  if (
    history.present.value === nextPresent.value &&
    history.present.selection.start === nextPresent.selection.start &&
    history.present.selection.end === nextPresent.selection.end
  ) {
    return history;
  }

  const nextPast = [...history.past, history.present].slice(-history.limit);
  return {
    past: nextPast,
    present: nextPresent,
    future: [],
    limit: history.limit,
  };
}

export function replaceHistoryPresent(
  history: MarkdownEditorHistoryState,
  nextValue: string,
  selection: MarkdownEditorSelection = createSelection(nextValue.length),
): MarkdownEditorHistoryState {
  return {
    ...history,
    present: createEditorSnapshot(nextValue, selection),
  };
}

export function canUndoHistory(history: MarkdownEditorHistoryState): boolean {
  return history.past.length > 0;
}

export function canRedoHistory(history: MarkdownEditorHistoryState): boolean {
  return history.future.length > 0;
}

export function undoHistory(history: MarkdownEditorHistoryState): MarkdownEditorHistoryState {
  if (!canUndoHistory(history)) return history;
  const previous = history.past[history.past.length - 1];
  return {
    past: history.past.slice(0, -1),
    present: previous,
    future: [history.present, ...history.future],
    limit: history.limit,
  };
}

export function redoHistory(history: MarkdownEditorHistoryState): MarkdownEditorHistoryState {
  if (!canRedoHistory(history)) return history;
  const [next, ...future] = history.future;
  return {
    past: [...history.past, history.present].slice(-history.limit),
    present: next,
    future,
    limit: history.limit,
  };
}
