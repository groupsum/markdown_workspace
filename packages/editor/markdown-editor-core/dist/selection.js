export function createSelection(start = 0, end = start, direction = "none") {
    return { start, end, direction };
}
export function normalizeSelection(selection, documentLength) {
    const start = clampOffset(selection.start, documentLength);
    const end = clampOffset(selection.end, documentLength);
    if (start <= end)
        return { start, end, direction: selection.direction ?? "none" };
    return { start: end, end: start, direction: selection.direction ?? "none" };
}
export function clampOffset(offset, documentLength) {
    if (Number.isNaN(offset))
        return 0;
    return Math.max(0, Math.min(documentLength, offset));
}
export function computeCursorPosition(value, offset) {
    const safeOffset = clampOffset(offset, value.length);
    const textBeforeCursor = value.slice(0, safeOffset);
    const lines = textBeforeCursor.split("\n");
    return {
        offset: safeOffset,
        line: lines.length,
        column: lines[lines.length - 1].length + 1,
    };
}
export function replaceSelection(value, selection, replacement) {
    const normalized = normalizeSelection(selection, value.length);
    const nextValue = `${value.slice(0, normalized.start)}${replacement}${value.slice(normalized.end)}`;
    const cursor = normalized.start + replacement.length;
    return {
        value: nextValue,
        selection: createSelection(cursor, cursor),
        changed: nextValue !== value,
    };
}
export function wrapSelection(value, selection, prefix, suffix = prefix) {
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
//# sourceMappingURL=selection.js.map