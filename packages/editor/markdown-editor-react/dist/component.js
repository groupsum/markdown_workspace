import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { DEFAULT_MARKDOWN_EDITOR_CLASS_NAMES, applyBuiltinMarkdownCommand, canRedoHistory, canUndoHistory, computeCursorPosition, createSelection, createHistoryState, normalizeSelection, pushHistoryEntry, redoHistory, replaceHistoryPresent, resetHistoryState, undoHistory, } from "@mdwrk/markdown-editor-core";
import { createMarkdownEditorThemeStyle } from "./theme.js";
const mergeClassNames = (...values) => values.filter(Boolean).join(" ");
function selectionEquals(a, b) {
    return a.start === b.start && a.end === b.end && (a.direction ?? "none") === (b.direction ?? "none");
}
function snapshotFromState(value, selection) {
    return { value, selection };
}
export const MarkdownSourceEditor = React.forwardRef(function MarkdownSourceEditor({ value, defaultValue, documentKey, onChange, onSelectionChange, onCursorChange, onHistoryChange, onCommand, className, style, themeStyle, placeholder = "Start typing...", spellCheck = false, autoFocus = false, disabled = false, showLineNumbers = true, historyLimit = 100, textareaClassName, gutterClassName, lineNumberClassName, indentUnit = "\t", themeVariables, }, ref) {
    const isControlled = value !== undefined;
    const initialValue = React.useMemo(() => value ?? defaultValue ?? "", []);
    const [draftValue, setDraftValue] = React.useState(initialValue);
    const [selection, setSelection] = React.useState(createSelection(initialValue.length, initialValue.length));
    const [history, setHistory] = React.useState(() => createHistoryState(initialValue, createSelection(initialValue.length, initialValue.length), historyLimit));
    const textareaRef = React.useRef(null);
    const gutterRef = React.useRef(null);
    const draftValueRef = React.useRef(draftValue);
    const selectionRef = React.useRef(selection);
    const historyRef = React.useRef(history);
    const pendingSelectionRef = React.useRef(null);
    React.useEffect(() => {
        draftValueRef.current = draftValue;
    }, [draftValue]);
    React.useEffect(() => {
        selectionRef.current = selection;
    }, [selection]);
    React.useEffect(() => {
        historyRef.current = history;
        onHistoryChange?.(history);
    }, [history, onHistoryChange]);
    React.useEffect(() => {
        if (documentKey === undefined)
            return;
        const nextValue = value ?? defaultValue ?? draftValueRef.current;
        const nextSelection = createSelection(nextValue.length, nextValue.length);
        setDraftValue(nextValue);
        setSelection(nextSelection);
        setHistory(resetHistoryState(nextValue, nextSelection, historyLimit));
        pendingSelectionRef.current = nextSelection;
    }, [documentKey]);
    React.useEffect(() => {
        if (!isControlled || value === undefined)
            return;
        if (value === draftValueRef.current)
            return;
        const nextSelection = normalizeSelection(selectionRef.current, value.length);
        setDraftValue(value);
        setSelection(nextSelection);
        setHistory((currentHistory) => replaceHistoryPresent(currentHistory, value, nextSelection));
        pendingSelectionRef.current = nextSelection;
    }, [isControlled, value]);
    React.useLayoutEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea)
            return;
        const nextSelection = pendingSelectionRef.current ?? selectionRef.current;
        const normalized = normalizeSelection(nextSelection, textarea.value.length);
        try {
            textarea.setSelectionRange(normalized.start, normalized.end, normalized.direction ?? "none");
        }
        catch {
            textarea.setSelectionRange(normalized.start, normalized.end);
        }
        pendingSelectionRef.current = null;
    }, [draftValue, selection]);
    const emitCursor = React.useCallback((nextValue, nextSelection) => {
        const cursor = computeCursorPosition(nextValue, nextSelection.end);
        onCursorChange?.(cursor.line, cursor.column);
    }, [onCursorChange]);
    const syncSelectionFromTextarea = React.useCallback(() => {
        const textarea = textareaRef.current;
        if (!textarea)
            return createSelection(0, 0);
        const nextSelection = normalizeSelection({
            start: textarea.selectionStart,
            end: textarea.selectionEnd,
            direction: textarea.selectionDirection ?? "none",
        }, textarea.value.length);
        if (!selectionEquals(selectionRef.current, nextSelection)) {
            setSelection(nextSelection);
            onSelectionChange?.(nextSelection);
        }
        emitCursor(textarea.value, nextSelection);
        return nextSelection;
    }, [emitCursor, onSelectionChange]);
    const commitValue = React.useCallback((nextValue, nextSelection, options = {}) => {
        const normalizedSelection = normalizeSelection(nextSelection, nextValue.length);
        setDraftValue(nextValue);
        setSelection(normalizedSelection);
        pendingSelectionRef.current = normalizedSelection;
        setHistory((currentHistory) => {
            return options.historic === false
                ? replaceHistoryPresent(currentHistory, nextValue, normalizedSelection)
                : pushHistoryEntry(currentHistory, nextValue, normalizedSelection);
        });
        onChange?.(nextValue);
        onSelectionChange?.(normalizedSelection);
        emitCursor(nextValue, normalizedSelection);
        if (options.focus) {
            requestAnimationFrame(() => textareaRef.current?.focus());
        }
    }, [emitCursor, onChange, onSelectionChange]);
    const applyEditResult = React.useCallback((result, options) => {
        if (!result.changed && options?.historic !== false)
            return snapshotFromState(draftValueRef.current, selectionRef.current);
        commitValue(result.value, result.selection, options);
        return snapshotFromState(result.value, result.selection);
    }, [commitValue]);
    const executeCommand = React.useCallback((command, options = {}) => {
        if (command === "undo") {
            const nextHistory = undoHistory(historyRef.current);
            setHistory(nextHistory);
            setDraftValue(nextHistory.present.value);
            setSelection(nextHistory.present.selection);
            pendingSelectionRef.current = nextHistory.present.selection;
            onChange?.(nextHistory.present.value);
            onSelectionChange?.(nextHistory.present.selection);
            emitCursor(nextHistory.present.value, nextHistory.present.selection);
            onCommand?.(command);
            return nextHistory.present;
        }
        if (command === "redo") {
            const nextHistory = redoHistory(historyRef.current);
            setHistory(nextHistory);
            setDraftValue(nextHistory.present.value);
            setSelection(nextHistory.present.selection);
            pendingSelectionRef.current = nextHistory.present.selection;
            onChange?.(nextHistory.present.value);
            onSelectionChange?.(nextHistory.present.selection);
            emitCursor(nextHistory.present.value, nextHistory.present.selection);
            onCommand?.(command);
            return nextHistory.present;
        }
        const result = applyBuiltinMarkdownCommand(command, draftValueRef.current, selectionRef.current, {
            indentUnit: options.indentUnit ?? indentUnit,
        });
        const snapshot = applyEditResult(result, { focus: true });
        onCommand?.(command);
        return snapshot;
    }, [applyEditResult, emitCursor, indentUnit, onChange, onCommand, onSelectionChange]);
    React.useImperativeHandle(ref, () => ({
        focus() {
            textareaRef.current?.focus();
        },
        getSnapshot() {
            return snapshotFromState(draftValueRef.current, selectionRef.current);
        },
        getSelection() {
            return selectionRef.current;
        },
        setSelection(nextSelection) {
            const normalized = normalizeSelection(nextSelection, draftValueRef.current.length);
            setSelection(normalized);
            pendingSelectionRef.current = normalized;
            onSelectionChange?.(normalized);
            emitCursor(draftValueRef.current, normalized);
        },
        applyEdit(result, options) {
            applyEditResult(result, { historic: options?.historic, focus: true });
        },
        executeCommand,
        undo() {
            executeCommand("undo");
        },
        redo() {
            executeCommand("redo");
        },
        canUndo() {
            return canUndoHistory(historyRef.current);
        },
        canRedo() {
            return canRedoHistory(historyRef.current);
        },
        getHistory() {
            return historyRef.current;
        },
        setValue(nextValue, options) {
            commitValue(nextValue, options?.selection ?? createSelection(nextValue.length), {
                historic: options?.historic,
                focus: true,
            });
        },
    }), [applyEditResult, commitValue, emitCursor, executeCommand, onSelectionChange]);
    const handleTextareaChange = React.useCallback((event) => {
        const nextValue = event.currentTarget.value;
        const nextSelection = normalizeSelection({
            start: event.currentTarget.selectionStart,
            end: event.currentTarget.selectionEnd,
            direction: event.currentTarget.selectionDirection ?? "none",
        }, nextValue.length);
        commitValue(nextValue, nextSelection);
    }, [commitValue]);
    const handleKeyDown = React.useCallback((event) => {
        if (disabled)
            return;
        const meta = event.metaKey || event.ctrlKey;
        const key = event.key.toLowerCase();
        if (!meta && event.key === "Tab") {
            event.preventDefault();
            executeCommand(event.shiftKey ? "outdent" : "indent", { indentUnit });
            return;
        }
        if (!meta)
            return;
        if (key === "b") {
            event.preventDefault();
            executeCommand("bold");
            return;
        }
        if (key === "i") {
            event.preventDefault();
            executeCommand("italic");
            return;
        }
        if (key === "x" && event.shiftKey) {
            event.preventDefault();
            executeCommand("strikethrough");
            return;
        }
        if (key === "z") {
            event.preventDefault();
            executeCommand(event.shiftKey ? "redo" : "undo");
            return;
        }
        if (key === "y") {
            event.preventDefault();
            executeCommand("redo");
        }
    }, [disabled, executeCommand, indentUnit]);
    const lineCount = React.useMemo(() => {
        const matches = draftValue.match(/\n/g);
        return (matches?.length ?? 0) + 1;
    }, [draftValue]);
    const mergedThemeStyle = React.useMemo(() => ({
        ...createMarkdownEditorThemeStyle(themeVariables),
        ...themeStyle,
        ...style,
    }), [style, themeStyle, themeVariables]);
    return (_jsx("div", { className: mergeClassNames(DEFAULT_MARKDOWN_EDITOR_CLASS_NAMES.root, "editor-stage", className), style: mergedThemeStyle, children: _jsxs("div", { className: mergeClassNames(DEFAULT_MARKDOWN_EDITOR_CLASS_NAMES.layout, "editor-layout-wrapper"), children: [showLineNumbers ? (_jsx("div", { ref: gutterRef, className: mergeClassNames(DEFAULT_MARKDOWN_EDITOR_CLASS_NAMES.gutter, "editor-gutter", gutterClassName), "aria-hidden": "true", children: Array.from({ length: lineCount }, (_, index) => (_jsx("div", { className: mergeClassNames(DEFAULT_MARKDOWN_EDITOR_CLASS_NAMES.lineNumber, "line-num", lineNumberClassName), children: index + 1 }, index + 1))) })) : null, _jsx("textarea", { ref: textareaRef, className: mergeClassNames(DEFAULT_MARKDOWN_EDITOR_CLASS_NAMES.textarea, "editor-textarea", textareaClassName), value: draftValue, onChange: handleTextareaChange, onKeyDown: handleKeyDown, onClick: syncSelectionFromTextarea, onKeyUp: syncSelectionFromTextarea, onSelect: syncSelectionFromTextarea, onScroll: (event) => {
                        if (gutterRef.current) {
                            gutterRef.current.scrollTop = event.currentTarget.scrollTop;
                        }
                    }, spellCheck: spellCheck, autoFocus: autoFocus, disabled: disabled, placeholder: placeholder, "data-testid": "markdown-source-editor" })] }) }));
});
//# sourceMappingURL=component.js.map