import React from 'react';
import { Folder, FilePlus, GitBranch, LayoutGrid, Download, Cloud, FileDown, FolderPlus, Printer, Upload } from 'lucide-react';
import { AppMode } from '../../../types';
import type { ActionRailExtensionButton } from '../../../services/actionRailExtensions';

interface ActionRailProps {
  sidebarOpen: boolean;
  appMode: AppMode;
  onToggleSidebar: () => void;
  onNewFile: () => void;
  onNewFolder: () => void;
  onToggleGit: () => void;
  onSwitchProject: () => void;
  onDownload: () => void;
  onExportHtml: () => void;
  onImportMarkdown: () => void;
  onPrint: () => void;
  onCloudSync: () => void;
  extensionButtons?: ActionRailExtensionButton[];
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
        aria-pressed={active === undefined ? undefined : active}
    >
        {icon}
    </button>
);

export const ActionRail: React.FC<ActionRailProps> = ({
  sidebarOpen,
  appMode,
  onToggleSidebar,
  onNewFile,
  onNewFolder,
  onToggleGit,
  onSwitchProject,
  onDownload,
  onExportHtml,
  onImportMarkdown,
  onPrint,
  onCloudSync,
  extensionButtons = [],
  className = ""
}) => {
  const topExtensions = extensionButtons.filter((button) => button.group === 'top');
  const bottomExtensions = extensionButtons.filter((button) => button.group === 'bottom');

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
              onClick={onNewFolder}
              icon={<FolderPlus />}
              title="New Folder"
            />
            <ToolbarButton 
              active={appMode === 'git'}
              onClick={onToggleGit}
              icon={<GitBranch />}
              title="Git Operations"
            />
            {topExtensions.map((button) => (
              <ToolbarButton
                key={button.id}
                onClick={button.onClick}
                icon={button.icon}
                title={button.title}
                className={button.className}
              />
            ))}
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
              onClick={onExportHtml}
              icon={<FileDown />}
              title="Export HTML"
            />
            <ToolbarButton 
              onClick={onImportMarkdown}
              icon={<Upload />}
              title="Import Markdown"
            />
            <ToolbarButton 
              onClick={onPrint}
              icon={<Printer />}
              title="Print Preview"
            />
            <ToolbarButton 
              onClick={onCloudSync}
              icon={<Cloud />}
              title="Cloud Sync"
              className="rail-btn--status"
            />
            {bottomExtensions.map((button) => (
              <ToolbarButton
                key={button.id}
                onClick={button.onClick}
                icon={button.icon}
                title={button.title}
                className={button.className}
              />
            ))}
          </div>
        </nav>
  );
};
