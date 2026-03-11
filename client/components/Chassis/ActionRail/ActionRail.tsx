import React from 'react';
import { Folder, FilePlus, GitBranch, LayoutGrid, Download, Cloud, FileDown, FolderPlus, Printer, Upload } from 'lucide-react';
import { AppMode } from '../../../types';
import { t } from '../../../i18n';

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
  className = ""
}) => {
  return (
        <nav className={`action-rail ${className}`} aria-label={t('_primary_actions')}>
          <div className="rail-group rail-group--top">
            <ToolbarButton 
              active={sidebarOpen && appMode === 'work'}
              onClick={onToggleSidebar}
              icon={<Folder />}
              title={t('_toggle_explorer')}
            />
            <ToolbarButton 
              onClick={onNewFile}
              icon={<FilePlus />}
              title={t('_new_file')}
            />
            <ToolbarButton 
              onClick={onNewFolder}
              icon={<FolderPlus />}
              title={t('_new_folder')}
            />
            <ToolbarButton 
              active={appMode === 'git'}
              onClick={onToggleGit}
              icon={<GitBranch />}
              title={t('_git_operations')}
            />
          </div>
          
          <div className="rail-spacer" />

          <div className="rail-group rail-group--bottom">
            <ToolbarButton 
              onClick={onSwitchProject}
              icon={<LayoutGrid />}
              title={t('_switch_project')}
            />
            <ToolbarButton 
              onClick={onDownload}
              icon={<Download />}
              title={t('_download_workspace')}
            />
            <ToolbarButton 
              onClick={onExportHtml}
              icon={<FileDown />}
              title={t('_export_html')}
            />
            <ToolbarButton 
              onClick={onImportMarkdown}
              icon={<Upload />}
              title={t('_import_markdown')}
            />
            <ToolbarButton 
              onClick={onPrint}
              icon={<Printer />}
              title={t('_print_preview')}
            />
            <ToolbarButton 
              onClick={onCloudSync}
              icon={<Cloud />}
              title={t('_cloud_sync')}
              className="rail-btn--status"
            />
          </div>
        </nav>
  );
};
