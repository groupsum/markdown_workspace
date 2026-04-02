import React from 'react';
import { Settings, X } from 'lucide-react';
import { ZoomControl } from '../../UI/ZoomControl';
import { ThemeDef } from '../../../data/themes';
import { FileNode, Tab, AppMode } from '../../../types';
import { useClientI18n } from '../../../src/features/i18n/useClientI18n';

interface HeaderProps {
  currentThemeDef: ThemeDef;
  projectTitle: string;
  tabs: Tab[];
  files: FileNode[];
  activeTabId: string | null;
  appMode: AppMode;
  zoom: number;
  pwaAction?: {
    label: string;
    title: string;
    icon: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
  };
  onSwitchProject: () => void;
  onTabSelect: (tabId: string, fileId: string) => void;
  onTabClose: (e: React.MouseEvent, tabId: string) => void;
  onZoom: (delta: number) => void;
  onOpenSettings: () => void;
  onResetZoom: () => void;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentThemeDef,
  projectTitle,
  tabs,
  files,
  activeTabId,
  appMode,
  zoom,
  pwaAction,
  onSwitchProject,
  onTabSelect,
  onTabClose,
  onZoom,
  onOpenSettings,
  onResetZoom,
  className = '',
}) => {
  const { t } = useClientI18n();

  return (
    <header className={`app-header ${className}`}>
      <div className="header-left">
        <div className="header-brand" onClick={onSwitchProject} title={t('core.header.switch-project.title', 'Switch Project')}>
          <span className="header-brand-title">
            {currentThemeDef.icon && React.cloneElement(currentThemeDef.icon as React.ReactElement<any>, { size: 16 })}
            {projectTitle}
          </span>
        </div>
      </div>

      <div className="header-center">
        <div className="tab-bar header-tabs">
          {tabs.map((tab) => {
            const file = files.find((entry) => entry.id === tab.fileId);
            const isActive = activeTabId === tab.id;
            const isExpanded = isActive && appMode === 'work';
            return (
              <div
                key={tab.id}
                onClick={() => onTabSelect(tab.id, tab.fileId)}
                className={`tab-item ${isActive ? 'active' : ''} ${isExpanded ? 'expanded' : ''}`}
              >
                <span className="tab-label">{file?.name || 'Untitled'}</span>
                <button
                  onClick={(event) => onTabClose(event, tab.id)}
                  className="tab-close"
                  aria-label={t('core.header.tab.close', 'Close tab')}
                >
                  <X size={12} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="header-right">
        <div className="header-controls">
          <div className="zoom-wrapper">
            <ZoomControl zoom={zoom} onZoom={onZoom} onReset={onResetZoom} />
          </div>
          <div className="header-btn-group">
            {pwaAction && (
              <button
                className="header-btn"
                onClick={pwaAction.onClick}
                title={pwaAction.title}
                aria-label={pwaAction.label}
                disabled={pwaAction.disabled}
              >
                {pwaAction.icon}
              </button>
            )}
            <button className="header-btn header-btn--settings" onClick={onOpenSettings} title={t('core.header.settings.title', 'System Config')}>
              <Settings size={16} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
