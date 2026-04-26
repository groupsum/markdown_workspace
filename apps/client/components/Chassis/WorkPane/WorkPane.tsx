
import React, { useState, useRef, useEffect } from 'react';
import { FileTree } from './Explorer/FileTree';
import { EditorPane } from './Stage/EditorPane';
import { Plus, HardDrive, Layout, FolderPlus, ChevronsUp, ChevronsDown, Pencil, Trash2 } from 'lucide-react';
import { FileNode, Project, AppTheme, ViewMode } from '../../../types';
import { ThemeDef } from '../../../data/themes';
import { useClientI18n } from '../../../src/features/i18n/useClientI18n';

interface WorkPaneProps {
  currentProject: Project | undefined;
  files: FileNode[];
  activeFile: FileNode | null;
  selectedExplorerId: string | null;
  searchQuery: string;
  theme: AppTheme;
  viewMode: ViewMode;
  currentThemeDef: ThemeDef;
  showLineNumbers: boolean;
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
  onExportHtml?: () => void;
  onPrintPreview?: () => void;
  workspaceSidebarSurface?: React.ReactNode;
  workspaceSidebarLabel?: string;
  workspaceSurface?: React.ReactNode;
}

const getSidebarWidthClassName = (width: number): string => {
  const clamped = Math.min(480, Math.max(180, width));
  const snapped = Math.round(clamped / 20) * 20;
  return `workspace-sidebar--width-${snapped}`;
};

const MIN_WORKSPACE_SIDEBAR_WIDTH = 180;
const MAX_WORKSPACE_SIDEBAR_WIDTH = 480;
const SIDEBAR_KEYBOARD_RESIZE_STEP = 20;

const clampSidebarWidth = (width: number): number => {
  if (!Number.isFinite(width)) {
    return MIN_WORKSPACE_SIDEBAR_WIDTH;
  }
  return Math.min(MAX_WORKSPACE_SIDEBAR_WIDTH, Math.max(MIN_WORKSPACE_SIDEBAR_WIDTH, width));
};

export const WorkPane: React.FC<WorkPaneProps> = ({
  currentProject,
  files,
  activeFile,
  selectedExplorerId,
  searchQuery,
  theme,
  viewMode,
  currentThemeDef,
  showLineNumbers,
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
  onExportHtml,
  onPrintPreview,
  workspaceSidebarSurface,
  workspaceSidebarLabel,
  workspaceSurface
}) => {
  const { t } = useClientI18n();
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

      event.preventDefault();
      const delta = event.clientX - resizeState.startX;
      const nextWidth = clampSidebarWidth(resizeState.startWidth + delta);
      onSidebarWidthChange(nextWidth);
    };

    const onPointerUp = () => {
      if (!sidebarResizeRef.current) return;
      sidebarResizeRef.current = null;
      document.body.classList.remove('is-resizing-sidebar');
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      document.body.classList.remove('is-resizing-sidebar');
    };
  }, [onSidebarWidthChange]);

  const handleSidebarResizeStart = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!sidebarOpen) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    sidebarResizeRef.current = {
      startX: event.clientX,
      startWidth: clampSidebarWidth(sidebarWidth)
    };
    document.body.classList.add('is-resizing-sidebar');
  };

  const handleSidebarResizeKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!sidebarOpen) return;

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      onSidebarWidthChange(clampSidebarWidth(sidebarWidth - SIDEBAR_KEYBOARD_RESIZE_STEP));
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      onSidebarWidthChange(clampSidebarWidth(sidebarWidth + SIDEBAR_KEYBOARD_RESIZE_STEP));
    } else if (event.key === 'Home') {
      event.preventDefault();
      onSidebarWidthChange(MIN_WORKSPACE_SIDEBAR_WIDTH);
    } else if (event.key === 'End') {
      event.preventDefault();
      onSidebarWidthChange(MAX_WORKSPACE_SIDEBAR_WIDTH);
    }
  };

  return (
    <section className="workspace-manifold">
      {/* THE REGISTRY (Explorer Plate) */}
      <aside
        className={`workspace-sidebar ${getSidebarWidthClassName(sidebarWidth)} ${!sidebarOpen ? 'is-collapsed' : ''}`}
        aria-label={workspaceSidebarLabel ?? 'File Explorer'}
      >
        {workspaceSidebarSurface ? (
          workspaceSidebarSurface
        ) : (
          <>
            <div className="workspace-panel-header">
              <div className="workspace-panel-title">
                <HardDrive size={10} className="settings-accent-text shrink-0" />
                <div className="workspace-panel-title-text">
                  <span className="workspace-panel-kicker">Workspace</span>
                  <span className="workspace-panel-name">{currentProject?.name ?? workspaceSidebarLabel ?? 'File Explorer'}</span>
                </div>
              </div>
              <div className="workspace-panel-actions">
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
          </>
        )}
      </aside>

      <div
        className={`workspace-sidebar-resizer ${sidebarOpen ? '' : 'is-hidden'}`}
        role="separator"
        aria-label="Resize file explorer"
        aria-orientation="vertical"
        aria-valuemin={MIN_WORKSPACE_SIDEBAR_WIDTH}
        aria-valuemax={MAX_WORKSPACE_SIDEBAR_WIDTH}
        aria-valuenow={clampSidebarWidth(sidebarWidth)}
        tabIndex={sidebarOpen ? 0 : -1}
        onPointerDown={handleSidebarResizeStart}
        onKeyDown={handleSidebarResizeKeyDown}
      />

      {/* THE EXECUTION STAGE (Stage Plate) */}
      <main className="workspace-stage" role="main">
        {workspaceSurface ? (
          workspaceSurface
        ) : activeFile ? (
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
            onExportHtml={onExportHtml}
            onPrintPreview={onPrintPreview}
          />
        ) : (
          <div className="workspace-idle-state">
            <div className="idle-indicator">
               <Layout size={48} strokeWidth={1} className="opacity-20 mb-4" />
               <div className="idle-text-stack">
                  <span className="idle-primary">{t('core.workspace.idle.primary', 'SYSTEM_IDLE')}</span>
                  <span className="idle-secondary">{t('core.workspace.idle.secondary', 'WAITING_FOR_MOUNT_INSTRUCTION')}</span>
               </div>
               <button onClick={onNewFile} className="idle-action-btn">
                 {t('core.workspace.idle.new-document', 'INIT_NEW_DOCUMENT')}
               </button>
            </div>
          </div>
        )}
      </main>
    </section>
  );
};
