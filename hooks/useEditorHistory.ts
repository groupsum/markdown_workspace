
import { useState, useEffect } from 'react';
import { FileNode } from '../types';

interface HistoryState {
  past: string[];
  present: string;
  future: string[];
}

export const useEditorHistory = (file: FileNode | null, onChange: (content: string) => void) => {
  console.log(`[useEditorHistory] Hook init for file -> ${file?.id}`);

  const [history, setHistory] = useState<HistoryState>({
    past: [],
    present: file?.content || '',
    future: []
  });

  useEffect(() => {
    if (file && file.content !== history.present) {
      console.log(`[useEditorHistory] Effect: File changed or content out of sync, resetting history for -> ${file.id}`);
      setHistory({
        past: [],
        present: file.content || '',
        future: []
      });
    }
  }, [file?.id]);

  const updateContent = (newContent: string, isHistoric: boolean = true) => {
    if (newContent === history.present) return;

    if (isHistoric) {
      console.log(`[useEditorHistory] Action: updateContent (Historic) length -> ${newContent.length}`);
      setHistory(curr => ({
        past: [...curr.past, curr.present],
        present: newContent,
        future: []
      }));
    } else {
      console.log(`[useEditorHistory] Action: updateContent (Silent) length -> ${newContent.length}`);
      setHistory(curr => ({ ...curr, present: newContent }));
    }
    onChange(newContent);
  };

  const undo = () => {
    if (history.past.length === 0) {
        console.warn("[useEditorHistory] Undo attempted with empty past");
        return;
    }
    const previous = history.past[history.past.length - 1];
    const newPast = history.past.slice(0, history.past.length - 1);
    
    console.log(`[useEditorHistory] Action: undo -> ${history.past.length - 1} states left`);
    setHistory({
      past: newPast,
      present: previous,
      future: [history.present, ...history.future]
    });
    onChange(previous);
  };

  const redo = () => {
    if (history.future.length === 0) {
        console.warn("[useEditorHistory] Redo attempted with empty future");
        return;
    }
    const next = history.future[0];
    const newFuture = history.future.slice(1);
    
    console.log(`[useEditorHistory] Action: redo -> ${history.future.length - 1} states ahead`);
    setHistory({
      past: [...history.past, history.present],
      present: next,
      future: newFuture
    });
    onChange(next);
  };

  return { history, updateContent, undo, redo };
};
