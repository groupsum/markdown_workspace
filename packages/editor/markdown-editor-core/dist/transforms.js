import { createSelection, normalizeSelection, replaceSelection } from "./selection.js";
function getSelectedLineRange(value, selection) {
    const normalized = normalizeSelection(selection, value.length);
    const lineStart = value.lastIndexOf("\n", Math.max(0, normalized.start - 1)) + 1;
    const nextBreak = value.indexOf("\n", normalized.end);
    const lineEnd = nextBreak === -1 ? value.length : nextBreak;
    const selectedBlock = value.slice(lineStart, lineEnd);
    const lines = selectedBlock.split("\n");
    const isMultiLine = lines.length > 1 || normalized.start !== normalized.end;
    return { lineStart, lineEnd, selectedBlock, lines, isMultiLine };
}
export function insertText(value, selection, text) {
    return replaceSelection(value, selection, text);
}
export function indentSelection(value, selection, indentUnit = "\t") {
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
export function outdentSelection(value, selection, indentUnit = "\t") {
    const normalized = normalizeSelection(selection, value.length);
    const { lineStart, lineEnd, lines, isMultiLine } = getSelectedLineRange(value, normalized);
    const removeIndent = (line) => {
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
            const currentLine = value.slice(currentLineStart, value.indexOf("\n", normalized.start) === -1 ? value.length : value.indexOf("\n", normalized.start));
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
        if (index === 0)
            removedBeforeStart = result.removed;
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
//# sourceMappingURL=transforms.js.map