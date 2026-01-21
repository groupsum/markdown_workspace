import React, { useState } from 'react';
import { X, Layout, GitBranch, Database, Keyboard, Download, Settings as SettingsIcon } from 'lucide-react';
import { AppTheme, GitConfig } from '../../types';
import { THEMES } from '../../data/themes';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
  gitConfig: GitConfig;
  onGitConfigChange: (config: GitConfig) => void;
  onExport: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  currentTheme,
  onThemeChange,
  gitConfig,
  onGitConfigChange,
  onExport
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'visual' | 'git' | 'data' | 'keys'>('visual');
  const themeIndex = Math.max(THEMES.findIndex((theme) => theme.id === currentTheme), 0);
  const themeDef = THEMES[themeIndex];
  const tabMeta: Record<typeof activeTab, { label: string; code: string }> = {
    visual: { label: 'Visual Matrix', code: '01' },
    git: { label: 'Source Control', code: '02' },
    data: { label: 'Storage Ops', code: '03' },
    keys: { label: 'Key Map', code: '04' }
  };

  const handleThemeStep = (direction: number) => {
    const nextIndex = (themeIndex + direction + THEMES.length) % THEMES.length;
    onThemeChange(THEMES[nextIndex].id);
  };

  const handleGitChange = (key: keyof GitConfig, value: string) => {
    onGitConfigChange({ ...gitConfig, [key]: value });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-base settings-modal">
        {/* Header */}
        <div className="modal-header">
          <span className="modal-title">
            <SettingsIcon size={18} className="text-[var(--accent)]" />
            System Configuration
          </span>
          <button onClick={onClose} className="modal-close"><X size={18} /></button>
        </div>

        <div className="settings-layout">
          {/* Sidebar */}
          <nav className="settings-sidebar">
            <button 
              onClick={() => setActiveTab('visual')}
              className={`settings-sidebar-btn ${activeTab === 'visual' ? 'active' : ''}`}
            >
              <Layout size={14} /> 01_VISUALS
            </button>
            <button 
              onClick={() => setActiveTab('git')}
              className={`settings-sidebar-btn ${activeTab === 'git' ? 'active' : ''}`}
            >
              <GitBranch size={14} /> 02_SOURCE_CTRL
            </button>
            <button 
              onClick={() => setActiveTab('data')}
              className={`settings-sidebar-btn ${activeTab === 'data' ? 'active' : ''}`}
            >
              <Database size={14} /> 03_STORAGE_IO
            </button>
            <button 
              onClick={() => setActiveTab('keys')}
              className={`settings-sidebar-btn ${activeTab === 'keys' ? 'active' : ''}`}
            >
              <Keyboard size={14} /> 04_KEYMAP
            </button>
          </nav>

          {/* Content */}
          <div className="settings-content">
            <div className="settings-content-header">
              <div className="settings-content-title">
                <span className="settings-content-kicker">{tabMeta[activeTab].code}_MODULE</span>
                <span className="settings-content-name">{tabMeta[activeTab].label}</span>
              </div>
              <div className="settings-content-meta">
                <span className="settings-content-meta-label">ACTIVE_THEME</span>
                <span className="settings-content-meta-value">{themeDef.name}</span>
              </div>
            </div>

            <div className="settings-content-frame">
              {activeTab === 'visual' && (
                <div className="settings-pane">
                  <h3 className="settings-section-title">THEME_MATRIX_SELECT</h3>
                  <div className="settings-grid-2">
                    {THEMES.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => onThemeChange(theme.id)}
                        className={`settings-theme-btn ${currentTheme === theme.id ? 'active' : ''}`}
                      >
                        <div className="settings-theme-header">
                            <span className={currentTheme === theme.id ? 'text-[var(--accent)]' : 'text-[var(--fg-muted)]'}>
                              {theme.icon}
                            </span>
                            <span className="settings-theme-name">
                              {theme.name}
                            </span>
                        </div>
                        <span className="settings-theme-desc">{theme.description}</span>
                        <span className="text-[10px] uppercase text-[var(--fg-muted)]">
                          CODE_SYNTAX • {theme.syntaxTheme.name}
                        </span>
                        <span className="text-[11px] text-[var(--fg-muted)]">
                          {theme.syntaxTheme.palette}
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="settings-theme-controls">
                    <div className="settings-theme-meta">
                      <span className="settings-theme-label">ACTIVE_THEME</span>
                      <span className="settings-theme-value">{themeDef.name}</span>
                      <span className="settings-theme-count">{themeIndex + 1}/{THEMES.length}</span>
                    </div>
                    <div className="settings-theme-actions">
                      <button
                        type="button"
                        className="settings-theme-action-btn"
                        onClick={() => handleThemeStep(-1)}
                      >
                        PREV_THEME
                      </button>
                      <button
                        type="button"
                        className="settings-theme-action-btn settings-theme-action-btn-primary"
                        onClick={() => handleThemeStep(1)}
                      >
                        NEXT_THEME
                      </button>
                    </div>
                  </div>
                </div>
              )}

            {activeTab === 'git' && (
              <div className="settings-pane">
                <h3 className="settings-section-title">GIT_PERSISTENCE_CONFIG</h3>
                <div className="settings-card settings-card-stack">
                  <div className="flex flex-col gap-4">
                      <label className="flex flex-col gap-2">
                        <span className="text-[10px] font-bold text-[var(--fg-muted)]">REPOSITORY URL</span>
                        <input 
                          className="modal-input !text-xs !py-3"
                          value={gitConfig.repoUrl}
                          onChange={e => handleGitChange('repoUrl', e.target.value)}
                          placeholder="https://github.com/user/repo"
                        />
                      </label>
                      <label className="flex flex-col gap-2">
                        <span className="text-[10px] font-bold text-[var(--fg-muted)]">BRANCH</span>
                        <input 
                          className="modal-input !text-xs !py-3"
                          value={gitConfig.branch}
                          onChange={e => handleGitChange('branch', e.target.value)}
                          placeholder="main"
                        />
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                          <label className="flex flex-col gap-2">
                            <span className="text-[10px] font-bold text-[var(--fg-muted)]">USERNAME</span>
                            <input 
                              className="modal-input !text-xs !py-3"
                              value={gitConfig.username}
                              onChange={e => handleGitChange('username', e.target.value)}
                              placeholder="user"
                            />
                          </label>
                          <label className="flex flex-col gap-2">
                            <span className="text-[10px] font-bold text-[var(--fg-muted)]">PAT</span>
                            <input 
                              type="password"
                              className="modal-input !text-xs !py-3"
                              value={gitConfig.pat}
                              onChange={e => handleGitChange('pat', e.target.value)}
                              placeholder="ghp_..."
                            />
                          </label>
                      </div>
                  </div>
                  <div className="settings-action-row">
                      <button className="modal-btn flex-1">TEST_LINK</button>
                      <button className="modal-btn flex-1 modal-btn-primary">SAVE_CONFIG</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="settings-pane">
                <h3 className="settings-section-title">STORAGE_MANAGEMENT</h3>
                <div className="flex flex-col gap-4">
                    <div className="settings-card settings-card-highlight bg-[var(--bg-inset)]">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-[11px] uppercase">IDB_CORE_DUMP</span>
                        <span className="text-[9px] px-2 py-0.5 border border-[var(--border-color)] bg-black text-white">JSON</span>
                      </div>
                      <p className="text-[11px] text-[var(--fg-muted)] mb-4 leading-relaxed">Extract entire IndexedDB workspace including files and metadata to a portable archive.</p>
                      <button onClick={onExport} className="modal-btn modal-btn-primary w-full flex items-center justify-center gap-2">
                        <Download size={14}/> EXECUTE_EXPORT
                      </button>
                    </div>
                    
                    <div className="settings-card settings-card-muted opacity-50 cursor-not-allowed">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-[11px] uppercase">RESTORE_IMAGE</span>
                        <span className="text-[9px] px-2 py-0.5 border border-[var(--border-color)]">LOCKED</span>
                      </div>
                      <p className="text-[11px] text-[var(--fg-muted)] mb-4">Restore workspace from a previously exported JSON image. (Module Pending)</p>
                      <button disabled className="modal-btn w-full">INIT_RESTORE</button>
                    </div>
                </div>
              </div>
            )}

            {activeTab === 'keys' && (
              <div className="settings-pane">
                <h3 className="settings-section-title">SYSTEM_KEY_MAP</h3>
                <div className="settings-card settings-card-list bg-[var(--bg-inset)]">
                    {[
                      { label: 'SAVE_BUFFER', key: 'CTRL/CMD+S' },
                      { label: 'COMMAND_PALETTE', key: 'CTRL/CMD+K' },
                      { label: 'NEW_FILE', key: 'CTRL/CMD+N' },
                      { label: 'TOGGLE_REGISTRY', key: 'CTRL/CMD+B' },
                      { label: 'FOCUS_REGISTRY', key: 'CTRL/CMD+SHIFT+E' },
                      { label: 'NEXT_TAB', key: 'CTRL/CMD+TAB' },
                      { label: 'PREV_TAB', key: 'CTRL/CMD+SHIFT+TAB' },
                      { label: 'VIEW_EDITOR', key: 'CTRL/CMD+1' },
                      { label: 'VIEW_SPLIT', key: 'CTRL/CMD+2' },
                      { label: 'VIEW_PREVIEW', key: 'CTRL/CMD+3' },
                      { label: 'FORMAT_BOLD', key: 'CTRL/CMD+B' },
                      { label: 'FORMAT_ITALIC', key: 'CTRL/CMD+I' },
                      { label: 'UNDO_OP', key: 'CTRL/CMD+Z' },
                      { label: 'REDO_OP', key: 'CTRL/CMD+SHIFT+Z' },
                      { label: 'SETTINGS', key: 'CTRL/CMD+,' },
                      { label: 'TOGGLE_GIT_MODE', key: 'CTRL/CMD+SHIFT+G' },
                      { label: 'ZOOM_IN', key: 'CTRL/CMD++' },
                      { label: 'ZOOM_OUT', key: 'CTRL/CMD+-' },
                      { label: 'RESET_ZOOM', key: 'CTRL/CMD+0' },
                      { label: 'PRINT_PREVIEW', key: 'CTRL/CMD+P' }
                    ].map((row, i) => (
                      <div key={i} className={`flex justify-between p-3 text-[11px] font-bold uppercase ${i !== 0 ? 'border-t border-[var(--border-color)]' : ''}`}>
                        <span className="text-[var(--fg-muted)]">{row.label}</span>
                        <span className="text-[var(--accent)] font-mono">{row.key}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

          </div>
        </div>
        </div>

        <footer className="modal-footer">
          <button onClick={onClose} className="modal-btn">EXIT_CONFIG</button>
        </footer>
      </div>
    </div>
  );
};
