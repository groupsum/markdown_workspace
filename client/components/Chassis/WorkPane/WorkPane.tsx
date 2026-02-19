
import React, { useState, useRef, useEffect } from 'react';
import { FileTree } from './Explorer/FileTree';
import { EditorPane } from './Stage/EditorPane';
import { Plus, Minus, HardDrive, Layout, FolderPlus, ChevronsUp, ChevronsDown, Pencil, Trash2 } from 'lucide-react';
import { FileNode, Project, AppTheme, ViewMode } from '../../../types';
import { ThemeDef } from '../../../data/themes';

interface WorkPaneProps {
  currentProject: Project | undefined;
  files: FileNode[];
  activeFile: FileNode | null;
  selectedExplorerId: string | null;
  searchQuery: string;
  theme: AppTheme;
  viewMode: ViewMode;
  currentThemeDef: ThemeDef;
  sidebarOpen: boolean;
  sidebarWidth: number;
  onSidebarToggle: (open: boolean) => void;
  onSidebarWidthChange: (width: number) => void;
  onNewFile: () => void;
  onNewFolder: () => void;
  onRenameSelected: () => void;
  onDeleteSelected: () => void;
  onFileSelect: (id: string) => void;
  onFileHighlight: (id: string) => void;
  onFileMove: (fileId: string, targetFolderId: string | null) => void;
  onContentChange: (content: string) => void;
  onCursorChange: (line: number, col: number) => void;
  onViewModeChange: (mode: ViewMode) => void;
  showLineNumbers: boolean;
}


export const WorkPane: React.FC<WorkPaneProps> = ({
  currentProject,
  files,
  activeFile,
  selectedExplorerId,
  searchQuery,
  theme,
  viewMode,
  currentThemeDef,
  sidebarOpen,
  sidebarWidth,
  onSidebarToggle,
  onSidebarWidthChange,
  onNewFile,
  onNewFolder,
  onRenameSelected,
  onDeleteSelected,
  onFileSelect,
  onFileHighlight,
  onFileMove,
  onContentChange,
  onCursorChange,
  onViewModeChange,
  showLineNumbers
}) => {
  const [expandAllSignal, setExpandAllSignal] = useState(0);
  const [collapseAllSignal, setCollapseAllSignal] = useState(0);
  const hasSelection = Boolean(selectedExplorerId);

  const sidebarResizeRef = useRef<{
    startX: number;
    startWidth: number;
  } | null>(null);

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      const resizeState = sidebarResizeRef.current;
      if (!resizeState) return;

      const delta = event.clientX - resizeState.startX;
      const nextWidth = Math.min(480, Math.max(180, resizeState.startWidth + delta));
      onSidebarWidthChange(nextWidth);
    };

    const onPointerUp = () => {
      if (!sidebarResizeRef.current) return;
      sidebarResizeRef.current = null;
      document.body.classList.remove('is-resizing-sidebar');
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      document.body.classList.remove('is-resizing-sidebar');
    };
  }, [onSidebarWidthChange]);

  const handleSidebarResizeStart = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!sidebarOpen) return;
    sidebarResizeRef.current = {
      startX: event.clientX,
      startWidth: sidebarWidth
    };
    document.body.classList.add('is-resizing-sidebar');
  };

  return (
    <section className="workspace-manifold">
      {/* THE REGISTRY (Explorer Plate) */}
      <aside 
        className={`workspace-sidebar ${!sidebarOpen ? 'is-collapsed' : ''}`}
        aria-label="File Explorer"
        style={{ width: sidebarOpen ? `${sidebarWidth}px` : undefined }}
      >
        <div className="workspace-panel-header">
          <div className="flex items-center gap-2 overflow-hidden">
             <HardDrive size={10} className="text-[var(--accent)] shrink-0" />
          </div>
          <div className="flex gap-1">
            <button
              className="panel-icon-btn"
              title="Expand All"
              onClick={() => {
                if (!sidebarOpen) {
                  onSidebarToggle(true);
                }
                setExpandAllSignal(prev => prev + 1);
              }}
            >
              <ChevronsDown size={12} />
            </button>
            <button
              className="panel-icon-btn"
              title="Collapse All"
              onClick={() => setCollapseAllSignal(prev => prev + 1)}
            >
              <ChevronsUp size={12} />
            </button>
            <button className="panel-icon-btn" title="New File" onClick={onNewFile}>
              <Plus size={12}/>
            </button>
            <button className="panel-icon-btn" title="New Folder" onClick={onNewFolder}>
              <FolderPlus size={12}/>
            </button>
            <button
              className="panel-icon-btn"
              title="Rename"
              onClick={onRenameSelected}
              disabled={!hasSelection}
            >
              <Pencil size={12} />
            </button>
            <button
              className="panel-icon-btn"
              title="Delete"
              onClick={onDeleteSelected}
              disabled={!hasSelection}
            >
              <Trash2 size={12} />
            </button>
            <button className="panel-icon-btn" title="Collapse" onClick={() => onSidebarToggle(false)}>
              <Minus size={12}/>
            </button>
          </div>
        </div>
        
        <div className="workspace-panel-content">
          <FileTree 
            files={files} 
            activeId={activeFile?.id || null} 
            selectedId={selectedExplorerId}
            onSelect={onFileSelect} 
            onHighlight={onFileHighlight}
            onMove={onFileMove}
            searchQuery={searchQuery}
            expandAllSignal={expandAllSignal}
            collapseAllSignal={collapseAllSignal}
          />
        </div>
      </aside>

      <div
        className={`workspace-sidebar-resizer ${sidebarOpen ? '' : 'is-hidden'}`}
        role="separator"
        aria-label="Resize file explorer"
        aria-orientation="vertical"
        onPointerDown={handleSidebarResizeStart}
      />

      {/* THE EXECUTION STAGE (Stage Plate) */}
      <main className="workspace-stage" role="main">
        {activeFile ? (
          <EditorPane 
            file={activeFile} 
            files={files}
            onChange={onContentChange} 
            onCursorChange={onCursorChange}
            onNavigate={onFileSelect}
            theme={theme}
            viewMode={viewMode}
            onViewModeChange={onViewModeChange}
            showLineNumbers={showLineNumbers}
          />
        ) : (
          <div className="workspace-idle-state">
            <div className="idle-indicator">
               <Layout size={48} strokeWidth={1} className="opacity-20 mb-4" />
               <div className="idle-text-stack">
                  <span className="idle-primary">SYSTEM_IDLE</span>
                  <span className="idle-secondary">WAITING_FOR_MOUNT_INSTRUCTION</span>
               </div>
               <button onClick={onNewFile} className="idle-action-btn">
                 INIT_NEW_DOCUMENT
               </button>
            </div>
          </div>
        )}
      </main>
    </section>
  );
};
