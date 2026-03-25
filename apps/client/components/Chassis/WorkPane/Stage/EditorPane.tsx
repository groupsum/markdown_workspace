import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FileNode, AppTheme, ViewMode } from '../../../../types';
import { Undo, Redo, Bold, Italic, Strikethrough, Columns, Maximize2, Eye } from 'lucide-react';
import {
  createHistoryState,
  type MarkdownEditorBuiltinCommandId,
  type MarkdownEditorHistoryState,
  type MarkdownSourceEditorHandle,
} from '@mdwrk/markdown-editor-react';
import { WorkspaceMarkdownRenderer } from '../../../Markdown/WorkspaceMarkdownRenderer';
import { WorkspaceMarkdownEditor } from '../../../Markdown/WorkspaceMarkdownEditor';
import { useActiveEditorBridge } from '../../../../src/features/editor/activeEditorBridge';

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

export const EditorPane: React.FC<EditorPaneProps> = ({
  file,
  files,
  onChange,
  onCursorChange,
  onNavigate,
  theme,
  viewMode,
  onViewModeChange,
}) => {
  const [splitPos, setSplitPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const getViewportWidth = () => {
    if (typeof window === 'undefined') return 1024;
    return window.visualViewport?.width ?? document.documentElement.clientWidth ?? window.innerWidth;
  };
  const [viewportWidth, setViewportWidth] = useState(getViewportWidth);
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<MarkdownSourceEditorHandle>(null);
  const activeEditorBridge = useActiveEditorBridge();
  const [historyState, setHistoryState] = useState<MarkdownEditorHistoryState>(createHistoryState(file?.content ?? ''));

  const isSplitAllowed = viewportWidth > 900;

  useEffect(() => {
    const handleResize = () => setViewportWidth(getViewportWidth());
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

  if (!file) return null;

  return (
    <div ref={containerRef} className="editor-pane-container">
      {isDragging && (
        <div className="fixed inset-0 z-[9999] cursor-col-resize" style={{ userSelect: 'none' }} />
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
                onNavigate={onNavigate}
                className="preview-pane p-8"
              />
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
            <button onClick={() => runCommand('strikethrough')} className="view-toolbar-btn" title="Strikethrough"><Strikethrough size={12}/></button>
            <div className="view-toolbar-divider"></div>
            <button onClick={() => runCommand('bold')} className="view-toolbar-btn" title="Bold"><Bold size={12}/></button>
            <button onClick={() => runCommand('italic')} className="view-toolbar-btn" title="Italic"><Italic size={12}/></button>
            <div className="view-toolbar-divider"></div>
            <button onClick={() => runCommand('undo')} disabled={!commandState.canUndo} className="view-toolbar-btn" title="Undo"><Undo size={12}/></button>
            <button onClick={() => runCommand('redo')} disabled={!commandState.canRedo} className="view-toolbar-btn" title="Redo"><Redo size={12}/></button>
          </div>
        </div>
      </div>
    </div>
  );
};
