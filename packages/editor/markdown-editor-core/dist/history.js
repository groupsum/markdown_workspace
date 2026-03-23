import { createSelection, normalizeSelection } from "./selection.js";
export function createEditorSnapshot(value = "", selection = createSelection(value.length)) {
    return {
        value,
        selection: normalizeSelection(selection, value.length),
    };
}
export function createHistoryState(initialValue = "", selection = createSelection(initialValue.length), limit = 100) {
    return {
        past: [],
        present: createEditorSnapshot(initialValue, selection),
        future: [],
        limit,
    };
}
export function resetHistoryState(value = "", selection = createSelection(value.length), limit = 100) {
    return createHistoryState(value, selection, limit);
}
export function pushHistoryEntry(history, nextValue, selection = createSelection(nextValue.length)) {
    const nextPresent = createEditorSnapshot(nextValue, selection);
    if (history.present.value === nextPresent.value &&
        history.present.selection.start === nextPresent.selection.start &&
        history.present.selection.end === nextPresent.selection.end) {
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
export function replaceHistoryPresent(history, nextValue, selection = createSelection(nextValue.length)) {
    return {
        ...history,
        present: createEditorSnapshot(nextValue, selection),
    };
}
export function canUndoHistory(history) {
    return history.past.length > 0;
}
export function canRedoHistory(history) {
    return history.future.length > 0;
}
export function undoHistory(history) {
    if (!canUndoHistory(history))
        return history;
    const previous = history.past[history.past.length - 1];
    return {
        past: history.past.slice(0, -1),
        present: previous,
        future: [history.present, ...history.future],
        limit: history.limit,
    };
}
export function redoHistory(history) {
    if (!canRedoHistory(history))
        return history;
    const [next, ...future] = history.future;
    return {
        past: [...history.past, history.present].slice(-history.limit),
        present: next,
        future,
        limit: history.limit,
    };
}
//# sourceMappingURL=history.js.map