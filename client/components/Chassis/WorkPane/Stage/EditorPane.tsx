import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkSupersub from 'remark-supersub';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { FileNode, AppTheme, ViewMode } from '../../../../types';
import { Undo, Redo, Bold, Italic, Columns, Maximize2, Eye } from 'lucide-react';
import { getSyntaxThemeStyle } from '../../../../data/themes';

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
  const [viewportWidth, setViewportWidth] = useState(
    typeof window === 'undefined' ? 1024 : window.innerWidth
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const [history, setHistory] = useState<HistoryState>({
    past: [],
    present: file?.content || '',
    future: []
  });

  const isSplitAllowed = viewportWidth > 900;
  const mergeClassNames = (...classes: Array<string | undefined>) =>
    classes.filter(Boolean).join(' ');
  const withAlignment = (
    align: string | undefined,
    style?: React.CSSProperties
  ): React.CSSProperties | undefined => {
    if (!align) return style;
    return { ...style, textAlign: align as React.CSSProperties['textAlign'] };
  };

  useEffect(() => {
    if (file && file.content !== history.present) {
      setHistory({
        past: [],
        present: file.content || '',
        future: []
      });
    }
  }, [file?.id]);

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isSplitAllowed && viewMode === 'split') {
      onViewModeChange('editor');
    }
  }, [isSplitAllowed, viewMode, onViewModeChange]);

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

  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab' && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;
      const text = textarea.value;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const lineStart = text.lastIndexOf('\n', start - 1) + 1;
      const lineEnd = (() => {
        const nextBreak = text.indexOf('\n', end);
        return nextBreak === -1 ? text.length : nextBreak;
      })();
      const selectedBlock = text.slice(lineStart, lineEnd);
      const lines = selectedBlock.split('\n');
      const isMultiLine = lines.length > 1 || start !== end;
      if (!isMultiLine) {
        if (e.shiftKey) {
          if (text[lineStart] === '\t') {
            const updated = `${text.slice(0, lineStart)}${text.slice(lineStart + 1)}`;
            updateContent(updated);
            setTimeout(() => {
              const nextPos = Math.max(start - 1, lineStart);
              textarea.focus();
              textarea.setSelectionRange(nextPos, nextPos);
              updateCursor();
            }, 0);
            return;
          }
        }
        const updated = `${text.slice(0, start)}\t${text.slice(end)}`;
        updateContent(updated);
        setTimeout(() => {
          const nextPos = start + 1;
          textarea.focus();
          textarea.setSelectionRange(nextPos, nextPos);
          updateCursor();
        }, 0);
        return;
      }

      let totalDelta = 0;
      let firstLineDelta = 0;
      const updatedLines = lines.map((line, index) => {
        if (e.shiftKey) {
          if (line.startsWith('\t')) {
            if (index === 0) firstLineDelta = -1;
            totalDelta -= 1;
            return line.slice(1);
          }
          if (line.startsWith('  ')) {
            if (index === 0) firstLineDelta = -2;
            totalDelta -= 2;
            return line.slice(2);
          }
          return line;
        }
        if (index === 0) firstLineDelta = 1;
        totalDelta += 1;
        return `\t${line}`;
      });

      const updated = `${text.slice(0, lineStart)}${updatedLines.join('\n')}${text.slice(lineEnd)}`;
      updateContent(updated);
      setTimeout(() => {
        const nextStart = Math.max(lineStart, start + firstLineDelta);
        const nextEnd = Math.max(nextStart, end + totalDelta);
        textarea.focus();
        textarea.setSelectionRange(nextStart, nextEnd);
        updateCursor();
      }, 0);
      return;
    }

    const meta = e.metaKey || e.ctrlKey;
    if (!meta) return;

    const key = e.key.toLowerCase();
    if (key === 'b') {
      e.preventDefault();
      insertFormat('**', '**');
      return;
    }
    if (key === 'i') {
      e.preventDefault();
      insertFormat('_', '_');
      return;
    }
    if (key === 'z') {
      e.preventDefault();
      if (e.shiftKey) {
        redo();
      } else {
        undo();
      }
      return;
    }
    if (key === 'y') {
      e.preventDefault();
      redo();
      return;
    }
    if (key === '1') {
      e.preventDefault();
      onViewModeChange('editor');
      return;
    }
    if (key === '2') {
      e.preventDefault();
      if (isSplitAllowed) {
        onViewModeChange('split');
      }
      return;
    }
    if (key === '3') {
      e.preventDefault();
      onViewModeChange('preview');
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

      <div className="editor-pane-shell">
        <div className={`editor-pane-body ${viewMode === 'split' ? 'is-split' : ''}`}>
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
                  onKeyDown={handleEditorKeyDown}
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
                  remarkPlugins={[remarkGfm, remarkSupersub]}
                  components={{
                    ul: ({node, ...props}) => <ul className="md-ul" {...props} />,
                    ol: ({node, ...props}) => <ol className="md-ol" {...props} />,
                    li: ({node, checked, ...props}) => {
                      const isTask = typeof checked === 'boolean';
                      return (
                        <li
                          className={mergeClassNames('md-li', isTask ? 'md-task-list-item' : undefined)}
                          data-checked={isTask ? String(checked) : undefined}
                          {...props}
                        />
                      );
                    },
                    table: ({node, className, children, ...props}: any) => {
                      const alignments = Array.isArray(node?.align) ? node.align : [];

                      return (
                        <table className={mergeClassNames('md-table', className)} {...props}>
                          {alignments.length > 0 && (
                            <colgroup className="md-table-columns">
                              {alignments.map((align: string | null, index: number) => (
                                <col
                                  key={`col-${index}`}
                                  className="md-table-column"
                                  style={withAlignment(align ?? undefined)}
                                />
                              ))}
                            </colgroup>
                          )}
                          {children}
                        </table>
                      );
                    },
                    thead: ({node, className, ...props}: any) => (
                      <thead className={mergeClassNames('md-table-head', className)} {...props} />
                    ),
                    tbody: ({node, className, ...props}: any) => (
                      <tbody className={mergeClassNames('md-table-body', className)} {...props} />
                    ),
                    tr: ({node, className, ...props}: any) => (
                      <tr className={mergeClassNames('md-table-row', className)} {...props} />
                    ),
                    th: ({node, className, align, style, ...props}: any) => (
                      <th
                        className={mergeClassNames('md-table-header', className)}
                        style={withAlignment(align, style)}
                        {...props}
                      />
                    ),
                    td: ({node, className, align, style, ...props}: any) => (
                      <td
                        className={mergeClassNames('md-table-cell', className)}
                        style={withAlignment(align, style)}
                        {...props}
                      />
                    ),
                    caption: ({node, className, ...props}: any) => (
                      <caption className={mergeClassNames('md-table-caption', className)} {...props} />
                    ),
                    colgroup: ({node, className, ...props}: any) => (
                      <colgroup className={mergeClassNames('md-table-columns', className)} {...props} />
                    ),
                    col: ({node, className, style, ...props}: any) => (
                      <col
                        className={mergeClassNames('md-table-column', className)}
                        style={style}
                        {...props}
                      />
                    ),
                    input: ({node, ...props}) => {
                      if (props.type === 'checkbox') {
                        return <input type="checkbox" className="md-checkbox" {...props} />;
                      }
                      return <input {...props} />;
                    },
                    code({node, inline, className, children, ...props}: any) {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline && match ? (
                        <div className="md-code-block">
                          <div className="md-code-header">{match[1]}</div>
                          <div className="md-code-surface">
                            <SyntaxHighlighter
                              style={getSyntaxThemeStyle(theme)}
                              language={match[1]}
                              PreTag="div"
                              customStyle={{ margin: 0, borderRadius: 0, border: 'none', background: 'transparent', padding: 0 }}
                              {...props}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          </div>
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

        <div className="view-toolbar" role="toolbar" aria-label="Work Pane Controls">
           <div className="view-toolbar-group">
             <button onClick={() => onViewModeChange('editor')} className={`view-toolbar-btn ${viewMode === 'editor' ? 'active' : ''}`} title="Editor Only"><Maximize2 size={12}/></button>
             <button
               onClick={() => onViewModeChange('split')}
               className={`view-toolbar-btn view-toolbar-btn--split ${viewMode === 'split' ? 'active' : ''}`}
               title="Split View"
               disabled={!isSplitAllowed}
             >
               <Columns size={12}/>
             </button>
             <button onClick={() => onViewModeChange('preview')} className={`view-toolbar-btn ${viewMode === 'preview' ? 'active' : ''}`} title="Preview Only"><Eye size={12}/></button>
             <div className="view-toolbar-divider"></div>
             <button onClick={() => insertFormat('**', '**')} className="view-toolbar-btn" title="Bold"><Bold size={12}/></button>
             <button onClick={() => insertFormat('_', '_')} className="view-toolbar-btn" title="Italic"><Italic size={12}/></button>
             <button onClick={undo} disabled={history.past.length === 0} className="view-toolbar-btn" title="Undo"><Undo size={12}/></button>
             <button onClick={redo} disabled={history.future.length === 0} className="view-toolbar-btn" title="Redo"><Redo size={12}/></button>
           </div>
        </div>
      </div>
    </div>
  );
};
