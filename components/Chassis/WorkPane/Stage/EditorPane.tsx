import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs, coy, tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { FileNode, AppTheme, ViewMode } from '../../../../types';
import { Undo, Redo, Bold, Italic, Columns, Maximize2, Eye } from 'lucide-react';

const syntaxThemeMap: Record<AppTheme, any> = {
  zinc: vs,
  micropress: coy,
  default: tomorrow
};

interface EditorPaneProps {
  file: FileNode | null;
  files: FileNode[];
  onChange: (content: string) => void;
  onCursorChange?: (line: number, col: number) => void;
  onNavigate: (fileId: string) => void;
  theme: AppTheme;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

interface HistoryState {
  past: string[];
  present: string;
  future: string[];
}

export const EditorPane: React.FC<EditorPaneProps> = ({ 
  file, 
  files,
  onChange, 
  onCursorChange,
  onNavigate,
  theme,
  viewMode,
  onViewModeChange
}) => {
  const [splitPos, setSplitPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const [history, setHistory] = useState<HistoryState>({
    past: [],
    present: file?.content || '',
    future: []
  });

  useEffect(() => {
    if (file && file.content !== history.present) {
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
      setHistory(curr => ({
        past: [...curr.past, curr.present],
        present: newContent,
        future: []
      }));
    } else {
      setHistory(curr => ({ ...curr, present: newContent }));
    }
    onChange(newContent);
  };

  const updateCursor = () => {
      if (textareaRef.current && onCursorChange) {
          const { value, selectionStart } = textareaRef.current;
          const textBeforeCursor = value.substring(0, selectionStart);
          const lines = textBeforeCursor.split('\n');
          const line = lines.length;
          const col = lines[lines.length - 1].length + 1;
          onCursorChange(line, col);
      }
  };

  const undo = () => {
    if (history.past.length === 0) return;
    const previous = history.past[history.past.length - 1];
    const newPast = history.past.slice(0, history.past.length - 1);
    setHistory({
      past: newPast,
      present: previous,
      future: [history.present, ...history.future]
    });
    onChange(previous);
  };

  const redo = () => {
    if (history.future.length === 0) return;
    const next = history.future[0];
    const newFuture = history.future.slice(1);
    setHistory({
      past: [...history.past, history.present],
      present: next,
      future: newFuture
    });
    onChange(next);
  };

  const insertFormat = (startTag: string, endTag: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
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
  };

  const handleMouseDown = () => setIsDragging(true);
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(20, Math.min(80, (x / rect.width) * 100));
      setSplitPos(percentage);
    };
    const handleMouseUp = () => setIsDragging(false);
    
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.userSelect = '';
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    };
  }, [isDragging]);

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  if (!file) return null;

  const lineCount = (history.present.match(/\n/g) || []).length + 1;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  return (
    <div ref={containerRef} className="editor-pane-container">
      {isDragging && (
        <div className="fixed inset-0 z-[9999] cursor-col-resize" style={{ userSelect: 'none' }} />
      )}

      <div className="view-toolbar">
         <div className="view-toolbar-group">
           <button onClick={() => onViewModeChange('editor')} className={`view-toolbar-btn ${viewMode === 'editor' ? 'active' : ''}`} title="Editor Only"><Maximize2 size={12}/></button>
           <button onClick={() => onViewModeChange('split')} className={`view-toolbar-btn ${viewMode === 'split' ? 'active' : ''}`} title="Split View"><Columns size={12}/></button>
           <button onClick={() => onViewModeChange('preview')} className={`view-toolbar-btn ${viewMode === 'preview' ? 'active' : ''}`} title="Preview Only"><Eye size={12}/></button>
           <div className="view-toolbar-divider"></div>
           <button onClick={() => insertFormat('**', '**')} className="view-toolbar-btn" title="Bold"><Bold size={12}/></button>
           <button onClick={() => insertFormat('_', '_')} className="view-toolbar-btn" title="Italic"><Italic size={12}/></button>
           <button onClick={undo} disabled={history.past.length === 0} className="view-toolbar-btn" title="Undo"><Undo size={12}/></button>
           <button onClick={redo} disabled={history.future.length === 0} className="view-toolbar-btn" title="Redo"><Redo size={12}/></button>
         </div>
      </div>

      <div className="editor-pane-body">
        {(viewMode === 'editor' || viewMode === 'split') && (
          <div className="editor-pane-column" style={{ width: viewMode === 'split' ? `${splitPos}%` : '100%' }}>
            <div className="editor-layout-wrapper">
              <div ref={lineNumbersRef} className="editor-gutter">
                 {lineNumbers.map(n => <div key={n} className="line-num">{n}</div>)}
              </div>
              <textarea
                ref={textareaRef}
                className="editor-textarea"
                value={history.present}
                onChange={(e) => updateContent(e.target.value)}
                onKeyUp={updateCursor}
                onClick={updateCursor}
                onScroll={handleScroll}
                spellCheck={false}
                placeholder="START_INPUT..."
              />
            </div>
          </div>
        )}

        {viewMode === 'split' && (
          <div 
            onMouseDown={handleMouseDown} 
            className={`editor-splitter ${isDragging ? 'dragging' : ''}`}
          >
            <div className="editor-splitter-handle" />
          </div>
        )}

        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className="editor-pane-column" style={{ width: viewMode === 'split' ? `${100 - splitPos}%` : '100%' }}>
            <div className="preview-pane markdown-body p-8">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  code({node, inline, className, children, ...props}: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <div className="md-code-block">
                        <div className="md-code-header">{match[1]}</div>
                        <SyntaxHighlighter style={syntaxThemeMap[theme] || tomorrow} language={match[1]} PreTag="div" {...props}>
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      </div>
                    ) : <code className="md-inline-code" {...props}>{children}</code>
                  }
                }}
              >
                {history.present}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};