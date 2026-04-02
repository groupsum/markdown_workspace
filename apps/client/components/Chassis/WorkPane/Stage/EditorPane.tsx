import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FileNode, AppTheme, ViewMode } from '../../../../types';
import {
  Undo,
  Redo,
  Bold,
  Italic,
  Strikethrough,
  List,
  ListChecks,
  Columns,
  Maximize2,
  Eye,
  IndentIncrease,
  IndentDecrease,
} from 'lucide-react';
import {
  createHistoryState,
  type MarkdownEditorBuiltinCommandId,
  type MarkdownEditorHistoryState,
  type MarkdownEditorSelectionFormatState,
  type MarkdownSourceEditorHandle,
} from '@mdwrk/markdown-editor-react';
import { WorkspaceMarkdownRenderer } from '../../../Markdown/WorkspaceMarkdownRenderer';
import { WorkspaceMarkdownEditor } from '../../../Markdown/WorkspaceMarkdownEditor';
import { useActiveEditorBridge } from '../../../../src/features/editor/activeEditorBridge';
import { isSplitViewAllowedForViewport } from '../../../../src/features/layout/splitViewPolicy';
import { useWorkspacePreferences } from '../../../../src/features/preferences/workspacePreferences';

interface EditorPaneProps {
  file: FileNode | null;
  files: FileNode[];
  onChange: (content: string) => void;
  onCursorChange?: (line: number, col: number) => void;
  onNavigate: (fileId: string) => void;
  theme: AppTheme;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  showLineNumbers: boolean;
}

const DEFAULT_SELECTION_STATE: MarkdownEditorSelectionFormatState = {
  bold: false,
  italic: false,
  strikethrough: false,
  bulletList: false,
  taskList: false,
};

export const EditorPane: React.FC<EditorPaneProps> = ({
  file,
  files,
  onChange,
  onCursorChange,
  onNavigate,
  theme,
  viewMode,
  onViewModeChange,
  showLineNumbers,
}) => {
  const workspacePreferences = useWorkspacePreferences();
  const [splitPos, setSplitPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [showTableBuilder, setShowTableBuilder] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableColumns, setTableColumns] = useState(3);
  const getViewportWidth = () => {
    if (typeof window === 'undefined') return 1024;
    return window.visualViewport?.width ?? document.documentElement.clientWidth ?? window.innerWidth;
  };
  const [viewportWidth, setViewportWidth] = useState(getViewportWidth);
  const [viewportHeight, setViewportHeight] = useState(() => window.visualViewport?.height ?? window.innerHeight);
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<MarkdownSourceEditorHandle>(null);
  const activeEditorBridge = useActiveEditorBridge();
  const [historyState, setHistoryState] = useState<MarkdownEditorHistoryState>(createHistoryState(file?.content ?? ''));
  const [selectionState, setSelectionState] = useState<MarkdownEditorSelectionFormatState>(DEFAULT_SELECTION_STATE);

  const isSplitAllowed = isSplitViewAllowedForViewport({ width: viewportWidth, height: viewportHeight });

  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(getViewportWidth());
      setViewportHeight(window.visualViewport?.height ?? window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    window.visualViewport?.addEventListener('resize', handleResize);
    window.visualViewport?.addEventListener('scroll', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      window.visualViewport?.removeEventListener('resize', handleResize);
      window.visualViewport?.removeEventListener('scroll', handleResize);
    };
  }, []);

  useEffect(() => {
    if (!isSplitAllowed && viewMode === 'split') {
      onViewModeChange('editor');
    }
  }, [isSplitAllowed, viewMode, onViewModeChange]);

  useEffect(() => {
    setHistoryState(createHistoryState(file?.content ?? ''));
    setSelectionState(DEFAULT_SELECTION_STATE);
  }, [file?.id]);

  useEffect(() => {
    if (!file?.id || !activeEditorBridge) return;
    activeEditorBridge.setActiveEditor(file.id, editorRef.current);
    return () => {
      activeEditorBridge.clearActiveEditor(file.id);
    };
  }, [activeEditorBridge, file?.id]);

  const handleMouseDown = () => setIsDragging(true);
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
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

  const commandState = useMemo(
    () => ({
      canUndo: historyState.past.length > 0,
      canRedo: historyState.future.length > 0,
    }),
    [historyState.future.length, historyState.past.length],
  );

  const runCommand = (command: MarkdownEditorBuiltinCommandId) => {
    editorRef.current?.executeCommand(command);
  };

  const isToolbarHidden = (id: string) => workspacePreferences.hiddenEditorToolbarButtons.includes(id);

  const insertTable = () => {
    if (!editorRef.current || !file) return;
    const selection = editorRef.current.getSelection();
    const value = file.content ?? '';
    const rows = Math.max(1, Math.min(12, tableRows));
    const columns = Math.max(1, Math.min(8, tableColumns));
    const header = `| ${Array.from({ length: columns }, (_, index) => `Column ${index + 1}`).join(' | ')} |`;
    const divider = `| ${Array.from({ length: columns }, () => '---').join(' | ')} |`;
    const body = Array.from(
      { length: rows },
      (_, rowIndex) => `| ${Array.from({ length: columns }, (_, columnIndex) => `R${rowIndex + 1}C${columnIndex + 1}`).join(' | ')} |`,
    ).join('\n');
    const table = `${header}\n${divider}\n${body}`;
    editorRef.current.setValue(`${value.slice(0, selection.start)}${table}${value.slice(selection.end)}`, {
      historic: true,
      selection: {
        start: selection.start,
        end: selection.start + table.length,
        direction: 'none',
      },
    });
    setShowTableBuilder(false);
  };

  if (!file) return null;

  return (
    <div ref={containerRef} className="editor-pane-container">
      {isDragging && (
        <div className="fixed inset-0 z-[9999] cursor-col-resize" style={{ userSelect: 'none' }} />
      )}

      {showTableBuilder && (
        <div className="modal-overlay">
          <div className="modal-base" style={{ width: 'min(420px, 92vw)' }}>
            <div className="modal-header">
              <span className="modal-title">INSERT_TABLE</span>
              <button type="button" onClick={() => setShowTableBuilder(false)} className="modal-close">X</button>
            </div>
            <div className="settings-pane">
              <div className="settings-card settings-card-stack">
                <div className="settings-grid-2">
                  <label className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-[var(--fg-muted)] uppercase">ROWS</span>
                    <input className="modal-input !text-xs !py-3" type="number" min={1} max={12} value={tableRows} onChange={(event) => setTableRows(Number(event.target.value) || 1)} />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-[var(--fg-muted)] uppercase">COLUMNS</span>
                    <input className="modal-input !text-xs !py-3" type="number" min={1} max={8} value={tableColumns} onChange={(event) => setTableColumns(Number(event.target.value) || 1)} />
                  </label>
                </div>
                <div className="settings-action-row">
                  <button type="button" className="modal-btn" onClick={() => setShowTableBuilder(false)}>CANCEL</button>
                  <button type="button" className="modal-btn modal-btn-primary" onClick={insertTable}>INSERT</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="editor-pane-shell">
        <div className={`editor-pane-body ${viewMode === 'split' ? 'is-split' : ''}`}>
          {(viewMode === 'editor' || viewMode === 'split') && (
            <div className="editor-pane-column" style={{ width: viewMode === 'split' ? `${splitPos}%` : '100%' }}>
              <WorkspaceMarkdownEditor
                ref={editorRef}
                documentKey={file.id}
                value={file.content ?? ''}
                onChange={onChange}
                onCursorChange={onCursorChange}
                onHistoryChange={setHistoryState}
                onSelectionFormatChange={setSelectionState}
                showLineNumbers={showLineNumbers}
                theme={theme}
                placeholder="START_INPUT..."
              />
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
              <WorkspaceMarkdownRenderer
                markdown={file.content ?? ''}
                theme={theme}
                files={files}
                currentFile={file}
                onNavigate={onNavigate}
                className="preview-pane p-8"
              />
            </div>
          )}
        </div>

        <div className="view-toolbar" role="toolbar" aria-label="Work Pane Controls">
          <div className="view-toolbar-group">
            {!isToolbarHidden('view-editor') && <button onClick={() => onViewModeChange('editor')} className={`view-toolbar-btn ${viewMode === 'editor' ? 'active' : ''}`} title="Editor Only"><Maximize2 size={12}/></button>}
            {!isToolbarHidden('view-split') && (
              <button
                onClick={() => onViewModeChange('split')}
                className={`view-toolbar-btn view-toolbar-btn--split ${viewMode === 'split' ? 'active' : ''}`}
                title="Split View"
                disabled={!isSplitAllowed}
              >
                <Columns size={12}/>
              </button>
            )}
            {!isToolbarHidden('view-preview') && <button onClick={() => onViewModeChange('preview')} className={`view-toolbar-btn ${viewMode === 'preview' ? 'active' : ''}`} title="Preview Only"><Eye size={12}/></button>}
            {!isToolbarHidden('insert-table') && <button onClick={() => setShowTableBuilder(true)} className="view-toolbar-btn" title="Insert Table"><span className="text-[10px] font-mono">n:m</span></button>}
            <div className="view-toolbar-divider"></div>
            {!isToolbarHidden('strikethrough') && <button onClick={() => runCommand('strikethrough')} className={`view-toolbar-btn ${selectionState.strikethrough ? 'active' : ''}`} title="Strikethrough"><Strikethrough size={12}/></button>}
            {!isToolbarHidden('bullet-list') && <button onClick={() => runCommand('bullet-list')} className={`view-toolbar-btn ${selectionState.bulletList ? 'active' : ''}`} title="Bullet List"><List size={12}/></button>}
            {!isToolbarHidden('task-list') && <button onClick={() => runCommand('task-list')} className={`view-toolbar-btn ${selectionState.taskList ? 'active' : ''}`} title="Task List"><ListChecks size={12}/></button>}
            {!isToolbarHidden('indent') && <button onClick={() => runCommand('indent')} className="view-toolbar-btn" title="Indent"><IndentIncrease size={12}/></button>}
            {!isToolbarHidden('outdent') && <button onClick={() => runCommand('outdent')} className="view-toolbar-btn" title="Outdent"><IndentDecrease size={12}/></button>}
            {!isToolbarHidden('inline-math') && <button onClick={() => runCommand('inline-math')} className="view-toolbar-btn" title="Inline Math"><span className="text-[10px] font-mono">$x$</span></button>}
            {!isToolbarHidden('footnote') && <button onClick={() => runCommand('footnote')} className="view-toolbar-btn" title="Footnote"><span className="text-[10px] font-mono">fn</span></button>}
            {!isToolbarHidden('superscript') && <button onClick={() => runCommand('superscript')} className="view-toolbar-btn" title="Superscript"><span className="text-[10px] font-mono">x2</span></button>}
            {!isToolbarHidden('subscript') && <button onClick={() => runCommand('subscript')} className="view-toolbar-btn" title="Subscript"><span className="text-[10px] font-mono">x2</span></button>}
            <div className="view-toolbar-divider"></div>
            {!isToolbarHidden('bold') && <button onClick={() => runCommand('bold')} className={`view-toolbar-btn ${selectionState.bold ? 'active' : ''}`} title="Bold"><Bold size={12}/></button>}
            {!isToolbarHidden('italic') && <button onClick={() => runCommand('italic')} className={`view-toolbar-btn ${selectionState.italic ? 'active' : ''}`} title="Italic"><Italic size={12}/></button>}
            <div className="view-toolbar-divider"></div>
            {!isToolbarHidden('undo') && <button onClick={() => runCommand('undo')} disabled={!commandState.canUndo} className="view-toolbar-btn" title="Undo"><Undo size={12}/></button>}
            {!isToolbarHidden('redo') && <button onClick={() => runCommand('redo')} disabled={!commandState.canRedo} className="view-toolbar-btn" title="Redo"><Redo size={12}/></button>}
          </div>
        </div>
      </div>
    </div>
  );
};
