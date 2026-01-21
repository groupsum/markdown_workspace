import React from 'react';
import { Folder, FilePlus, GitBranch, LayoutGrid, Download, Cloud } from 'lucide-react';
import { AppMode } from '../../../../types';

interface ActionRailProps {
  sidebarOpen: boolean;
  appMode: AppMode;
  onToggleSidebar: () => void;
  onNewFile: () => void;
  onToggleGit: () => void;
  onSwitchProject: () => void;
  onDownload: () => void;
  onCloudSync: () => void;
  className?: string;
}

const ToolbarButton: React.FC<{
    active?: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    title: string;
    className?: string;
}> = ({ active, onClick, icon, title, className = '' }) => (
    <button 
        className={`rail-btn ${active ? 'is-active' : ''} ${className}`}
        onClick={onClick}
        title={title}
        aria-label={title}
    >
        {icon}
    </button>
);

export const ActionRail: React.FC<ActionRailProps> = ({
  sidebarOpen,
  appMode,
  onToggleSidebar,
  onNewFile,
  onToggleGit,
  onSwitchProject,
  onDownload,
  onCloudSync,
  className = ""
}) => {
  return (
        <nav className={`action-rail ${className}`} aria-label="Primary Actions">
          <div className="rail-group rail-group--top">
            <ToolbarButton 
              active={sidebarOpen && appMode === 'work'}
              onClick={onToggleSidebar}
              icon={<Folder />}
              title="Toggle Explorer"
            />
            <ToolbarButton 
              onClick={onNewFile}
              icon={<FilePlus />}
              title="New File"
            />
            <ToolbarButton 
              active={appMode === 'git'}
              onClick={onToggleGit}
              icon={<GitBranch />}
              title="Git Operations"
            />
          </div>
          
          <div className="rail-spacer" />

          <div className="rail-group rail-group--bottom">
            <ToolbarButton 
              onClick={onSwitchProject}
              icon={<LayoutGrid />}
              title="Switch Project"
            />
            <ToolbarButton 
              onClick={onDownload}
              icon={<Download />}
              title="Download Workspace"
            />
            <ToolbarButton 
              onClick={onCloudSync}
              icon={<Cloud />}
              title="Cloud Sync (Mock)"
              className="rail-btn--status"
            />
          </div>
        </nav>
  );
};