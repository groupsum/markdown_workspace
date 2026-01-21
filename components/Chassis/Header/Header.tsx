import React from 'react';
import { ZoomControl } from '../../UI/ZoomControl';
import { Settings, X } from 'lucide-react';
import { FileNode, Tab, AppMode } from '../../../../types';
import { ThemeDef } from '../../../../data/themes';

interface HeaderProps {
  currentThemeDef: ThemeDef;
  tabs: Tab[];
  files: FileNode[];
  activeTabId: string | null;
  appMode: AppMode;
  zoom: number;
  onSwitchProject: () => void;
  onTabSelect: (tabId: string, fileId: string) => void;
  onTabClose: (e: React.MouseEvent, tabId: string) => void;
  onZoom: (delta: number) => void;
  onOpenSettings: () => void;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentThemeDef,
  tabs,
  files,
  activeTabId,
  appMode,
  zoom,
  onSwitchProject,
  onTabSelect,
  onTabClose,
  onZoom,
  onOpenSettings,
  className = ""
}) => {
  return (
      <header className={`app-header ${className}`}>
        <div className="header-left">
          <div className="header-brand" onClick={onSwitchProject} title="Switch Project">
            <span className="header-brand-title">
              {currentThemeDef.icon && React.cloneElement(currentThemeDef.icon as React.ReactElement<any>, { size: 16 })}
              {currentThemeDef.name}
            </span>
          </div>
        </div>
        
        <div className="header-center">
          <div className="tab-bar header-tabs">
            {tabs.map(tab => {
               const f = files.find(file => file.id === tab.fileId);
               const isActive = activeTabId === tab.id;
               const isExpanded = isActive && appMode === 'work';
               
               return (
                 <div 
                   key={tab.id}
                   onClick={() => onTabSelect(tab.id, tab.fileId)}
                   className={`tab-item ${isActive ? 'active' : ''} ${isExpanded ? 'expanded' : ''}`}
                 >
                   <span className="tab-label">{f?.name || 'Untitled'}</span>
                   <button 
                     onClick={(e) => onTabClose(e, tab.id)}
                     className="tab-close"
                     aria-label="Close tab"
                   >
                     <X size={12} />
                   </button>
                 </div>
               )
            })}
          </div>
        </div>

        <div className="header-right">
          <div className="header-controls">
            <div className="zoom-wrapper">
              <ZoomControl zoom={zoom} onZoom={onZoom} />
            </div>
            <div className="header-btn-group">
              <button className="header-btn" onClick={onOpenSettings} title="System Config">
                <Settings size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>
  );
};
