
import React, { useState } from 'react';
import { FileTree } from './Explorer/FileTree';
import { EditorPane } from './Stage/EditorPane';
import { Plus, Minus, HardDrive, Layout, FolderPlus, ChevronsUp, ChevronsDown } from 'lucide-react';
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
  onSidebarToggle: (open: boolean) => void;
  onNewFile: () => void;
  onNewFolder: () => void;
  onFileSelect: (id: string) => void;
  onFileHighlight: (id: string) => void;
  onFileMove: (fileId: string, targetFolderId: string | null) => void;
  onContentChange: (content: string) => void;
  onCursorChange: (line: number, col: number) => void;
  onViewModeChange: (mode: ViewMode) => void;
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
  onSidebarToggle,
  onNewFile,
  onNewFolder,
  onFileSelect,
  onFileHighlight,
  onFileMove,
  onContentChange,
  onCursorChange,
  onViewModeChange
}) => {
  const [expandAllSignal, setExpandAllSignal] = useState(0);
  const [collapseAllSignal, setCollapseAllSignal] = useState(0);

  return (
    <section className="workspace-manifold">
      {/* THE REGISTRY (Explorer Plate) */}
      <aside 
        className={`workspace-sidebar ${!sidebarOpen ? 'is-collapsed' : ''}`}
        aria-label="File Explorer"
      >
        <div className="workspace-panel-header">
          <div className="flex items-center gap-2 overflow-hidden">
             <HardDrive size={10} className="text-[var(--accent)] shrink-0" />
             <span className="font-black text-[9px] uppercase tracking-widest truncate">
               {currentProject?.name || 'REGISTRY'}
             </span>
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
