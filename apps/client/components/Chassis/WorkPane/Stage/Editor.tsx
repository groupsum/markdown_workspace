import React, { useRef } from 'react';
import { ViewMode } from '../../../../types';
import { useEditorMetrics } from '../../../../hooks/useEditorMetrics';
import { useEditorShortcuts } from '../../../../hooks/useEditorShortcuts';

interface EditorProps {
  content: string;
  history: any;
  updateContent: (content: string, isHistoric?: boolean) => void;
  undo: () => void;
  redo: () => void;
  onCursorChange?: (line: number, col: number) => void;
  viewMode: ViewMode;
  splitPos: number;
}

export const Editor: React.FC<EditorProps> = ({
  content,
  history,
  updateContent,
  undo,
  redo,
  onCursorChange,
  viewMode,
  splitPos
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);

  const { lineHeights } = useEditorMetrics(textareaRef, ghostRef, content, splitPos, viewMode);
  const { insertFormat, updateCursor } = useEditorShortcuts({
    textareaRef,
    history,
    updateContent,
    undo,
    redo,
    onCursorChange
  });

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  return (
    <div className="editor-stage">
      <div className="editor-layout-wrapper">
        {/* Gutter */}
        <div 
          ref={lineNumbersRef}
          className="editor-gutter"
        >
           {lineHeights.map((h, i) => (
             <div key={i} className="line-num">{i + 1}</div>
           ))}
        </div>

        {/* Ghost Element for measurement */}
        <div 
            ref={ghostRef}
            aria-hidden="true"
            className="editor-ghost"
        />

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          className="editor-textarea"
          value={content}
          onChange={(e) => updateContent(e.target.value)}
          onKeyUp={updateCursor}
          onClick={updateCursor}
          onScroll={handleScroll}
          spellCheck={false}
          placeholder="Start typing..."
        />
      </div>
    </div>
  );
};
