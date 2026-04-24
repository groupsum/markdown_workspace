
import { useEffect, RefObject, useCallback } from 'react';

interface UseEditorShortcutsProps {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  history: any;
  updateContent: (content: string) => void;
  undo: () => void;
  redo: () => void;
  onCursorChange?: (line: number, col: number) => void;
}

export const useEditorShortcuts = ({
  textareaRef,
  history,
  updateContent,
  undo,
  redo,
  onCursorChange
}: UseEditorShortcutsProps) => {

  const updateCursor = useCallback(() => {
      if (textareaRef.current && onCursorChange) {
          const { value, selectionStart } = textareaRef.current;
          const textBeforeCursor = value.substring(0, selectionStart);
          const lines = textBeforeCursor.split('\n');
          const line = lines.length;
          const col = lines[lines.length - 1].length + 1;
          console.log(`[useEditorShortcuts] Cursor Update: L${line} C${col}`);
          onCursorChange(line, col);
      }
  }, [textareaRef, onCursorChange]);

  const insertFormat = useCallback((startTag: string, endTag: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    console.log(`[useEditorShortcuts] Action: insertFormat -> ${startTag}...${endTag}`);
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const selection = text.substring(start, end);
    const after = text.substring(end);
    const newText = `${before}${startTag}${selection}${endTag}${after}`;
    updateContent(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + startTag.length, end + startTag.length);
      updateCursor();
    }, 0);
  }, [textareaRef, updateContent, updateCursor]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;
      if (!textareaRef.current || document.activeElement !== textareaRef.current) return;
      if ((e.ctrlKey || e.metaKey)) {
        if (e.key === 'z') {
          e.preventDefault();
          if (e.shiftKey) {
              console.log("[useEditorShortcuts] Keyboard: Redo (Ctrl+Shift+Z)");
              redo();
          } else {
              console.log("[useEditorShortcuts] Keyboard: Undo (Ctrl+Z)");
              undo();
          }
        } else if (e.key === 'y') {
          console.log("[useEditorShortcuts] Keyboard: Redo (Ctrl+Y)");
          e.preventDefault();
          redo();
        } else if (!e.altKey && !e.shiftKey && e.key === 'b') {
          console.log("[useEditorShortcuts] Keyboard: Format Bold (Ctrl+B)");
          e.preventDefault();
          insertFormat('**', '**');
        } else if (!e.altKey && e.key === 'i') {
          console.log("[useEditorShortcuts] Keyboard: Format Italic (Ctrl+I)");
          e.preventDefault();
          insertFormat('_', '_');
        }
      } else if (e.key === 'Tab') {
          console.log("[useEditorShortcuts] Keyboard: Tab (2 spaces)");
          e.preventDefault();
          const textarea = textareaRef.current;
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const value = textarea.value;
          const newValue = value.substring(0, start) + "  " + value.substring(end);
          updateContent(newValue);
          setTimeout(() => {
              textarea.selectionStart = textarea.selectionEnd = start + 2;
              updateCursor();
          }, 0);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [history, updateContent, undo, redo, textareaRef, insertFormat, updateCursor]);

  return { insertFormat, updateCursor };
};
