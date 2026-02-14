import React, { useState } from 'react';
import { X, Layout, GitBranch, Database, Keyboard, Download, RefreshCw, Settings as SettingsIcon, Monitor, Save } from 'lucide-react';
import { OidcSignInSelector } from './OidcSignInSelector';
import { RepositoryAutocomplete } from './RepositoryAutocomplete';
import { AppTheme, AppMode, GitConfig, ViewMode } from '../../types';
import { THEMES } from '../../data/themes';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
  gitConfig: GitConfig;
  onGitConfigChange: (config: GitConfig) => void;
  onOidcSignIn: () => void;
  onExport: () => void;
  pwaState: {
    canInstall: boolean;
    updateAvailable: boolean;
    isInstalled: boolean;
    autoUpdateEnabled: boolean;
    isSupported: boolean;
  };
  onPwaInstall: () => void;
  onPwaUpdate: () => void;
  onPwaAutoUpdateToggle: (enabled: boolean) => void;
  sessionState: {
    currentProjectName: string | null;
    tabCount: number;
    activeTabName: string | null;
    zoom: number;
    viewMode: ViewMode;
    appMode: AppMode;
    autoSaveEnabled: boolean;
    persistSessionEnabled: boolean;
  };
  onAutoSaveToggle: (enabled: boolean) => void;
  onPersistSessionToggle: (enabled: boolean) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  currentTheme,
  onThemeChange,
  gitConfig,
  onGitConfigChange,
  onOidcSignIn,
  onExport,
  pwaState,
  onPwaInstall,
  onPwaUpdate,
  onPwaAutoUpdateToggle,
  sessionState,
  onAutoSaveToggle,
  onPersistSessionToggle
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'visual' | 'git' | 'data' | 'keys' | 'session'>('visual');
  const themeIndex = Math.max(THEMES.findIndex((theme) => theme.id === currentTheme), 0);
  const themeDef = THEMES[themeIndex];
  const tabMeta: Record<typeof activeTab, { label: string; code: string }> = {
    visual: { label: 'Visual Matrix', code: '' },
    git: { label: 'Source Control', code: '' },
    data: { label: 'Storage Ops', code: '' },
    keys: { label: 'Key Map', code: '' },
    session: { label: 'Session State', code: '' }
  };

  const handleThemeStep = (direction: number) => {
    const nextIndex = (themeIndex + direction + THEMES.length) % THEMES.length;
    onThemeChange(THEMES[nextIndex].id);
  };

  const handleGitChange = (key: keyof GitConfig, value: string) => {
    onGitConfigChange({ ...gitConfig, [key]: value });
  };

  const pwaStatusLabel = pwaState.isInstalled ? 'INSTALLED' : 'NOT_INSTALLED';
  const pwaUpdateLabel = pwaState.updateAvailable ? 'UPDATE_READY' : 'UP_TO_DATE';

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
              title="Visual Matrix"
            >
              <Layout size={14} className="settings-sidebar-icon" />
              <span className="settings-sidebar-label">VISUALS</span>
            </button>
            <button 
              onClick={() => setActiveTab('git')}
              className={`settings-sidebar-btn ${activeTab === 'git' ? 'active' : ''}`}
              title="Source Control"
            >
              <GitBranch size={14} className="settings-sidebar-icon" />
              <span className="settings-sidebar-label">SOURCE_CTRL</span>
            </button>
            <button 
              onClick={() => setActiveTab('data')}
              className={`settings-sidebar-btn ${activeTab === 'data' ? 'active' : ''}`}
              title="Storage Ops"
            >
              <Database size={14} className="settings-sidebar-icon" />
              <span className="settings-sidebar-label">STORAGE_IO</span>
            </button>
            <button 
              onClick={() => setActiveTab('keys')}
              className={`settings-sidebar-btn ${activeTab === 'keys' ? 'active' : ''}`}
              title="Key Map"
            >
              <Keyboard size={14} className="settings-sidebar-icon" />
              <span className="settings-sidebar-label">KEYMAP</span>
            </button>
            <button
              onClick={() => setActiveTab('session')}
              className={`settings-sidebar-btn ${activeTab === 'session' ? 'active' : ''}`}
              title="Session State"
            >
              <Monitor size={14} className="settings-sidebar-icon" />
              <span className="settings-sidebar-label">SESSION</span>
            </button>
          </nav>

          {/* Content */}
          <div className="settings-content">
            <div className="settings-content-header">
              <div className="settings-content-title">
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
                                <div className="settings-card settings-card-stack">
                  <div className="flex flex-col gap-4">
                      <OidcSignInSelector
                        gitConfig={gitConfig}
                        onGitConfigChange={onGitConfigChange}
                        onOidcSignIn={onOidcSignIn}
                      />
                      <RepositoryAutocomplete
                        gitConfig={gitConfig}
                        onRepoUrlChange={(value) => handleGitChange('repoUrl', value)}
                      />
                      <label className="flex flex-col gap-2">
                        <span className="text-[10px] font-bold text-[var(--fg-muted)]">BRANCH</span>
                        <input
                          className="modal-input !text-xs !py-3"
                          value={gitConfig.branch}
                          onChange={e => handleGitChange('branch', e.target.value)}
                          placeholder="main"
                        />
                      </label>
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
                                <div className="flex flex-col gap-4">
                    <div className="settings-card settings-card-highlight bg-[var(--bg-inset)]">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-[11px] uppercase">PWA_DEPLOYMENT</span>
                        <span className="text-[9px] px-2 py-0.5 border border-[var(--border-color)] bg-black text-white">{pwaStatusLabel}</span>
                      </div>
                      <p className="text-[11px] text-[var(--fg-muted)] mb-4 leading-relaxed">
                        Manage offline installation and apply background updates without blocking the active session.
                      </p>
                      <div className="pwa-status-grid">
                        <div className="pwa-status-row">
                          <span className="pwa-status-label">UPDATE_STATE</span>
                          <span className={`pwa-status-value ${pwaState.updateAvailable ? 'is-ready' : ''}`}>{pwaUpdateLabel}</span>
                        </div>
                        <div className="pwa-status-row">
                          <span className="pwa-status-label">SERVICE_WORKER</span>
                          <span className="pwa-status-value">{pwaState.isSupported ? 'AVAILABLE' : 'UNAVAILABLE'}</span>
                        </div>
                      </div>
                      <div className="settings-action-row">
                        <button
                          className="modal-btn flex-1"
                          onClick={onPwaInstall}
                          disabled={!pwaState.canInstall}
                        >
                          INSTALL_PWA
                        </button>
                        <button
                          className="modal-btn flex-1 modal-btn-primary"
                          onClick={onPwaUpdate}
                          disabled={!pwaState.updateAvailable}
                        >
                          <RefreshCw size={14}/> APPLY_UPDATE
                        </button>
                      </div>
                      <label className="pwa-toggle">
                        <input
                          type="checkbox"
                          checked={pwaState.autoUpdateEnabled}
                          onChange={(event) => onPwaAutoUpdateToggle(event.target.checked)}
                        />
                        <span className="pwa-toggle-indicator" />
                        <span className="pwa-toggle-label">AUTO_UPDATE</span>
                      </label>
                    </div>
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
                                <div className="settings-card settings-card-list settings-keymap-grid bg-[var(--bg-inset)]">
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
                      { label: 'FORMAT_STRIKETHROUGH', key: 'CTRL/CMD+SHIFT+X' },
                      { label: 'UNDO_OP', key: 'CTRL/CMD+Z' },
                      { label: 'REDO_OP', key: 'CTRL/CMD+SHIFT+Z' },
                      { label: 'SETTINGS', key: 'CTRL/CMD+,' },
                      { label: 'TOGGLE_GIT_MODE', key: 'CTRL/CMD+SHIFT+G' },
                      { label: 'ZOOM_IN', key: 'CTRL/CMD++' },
                      { label: 'ZOOM_OUT', key: 'CTRL/CMD+-' },
                      { label: 'RESET_ZOOM', key: 'CTRL/CMD+0' },
                      { label: 'PRINT_PREVIEW', key: 'CTRL/CMD+P' }
                    ].map((row, i) => (
                      <div key={i} className="settings-keymap-item">
                        <span className="settings-keymap-label text-[var(--fg-muted)]">{row.label}</span>
                        <span className="settings-keymap-key text-[var(--accent)] font-mono">{row.key}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {activeTab === 'session' && (
              <div className="settings-pane">
                                <div className="flex flex-col gap-4">
                  <div className="settings-card settings-card-stack">
                    <div className="settings-session-grid">
                      <div className="settings-session-item">
                        <span className="settings-session-label">ACTIVE_PROJECT</span>
                        <span className="settings-session-value">{sessionState.currentProjectName ?? 'NONE'}</span>
                      </div>
                      <div className="settings-session-item">
                        <span className="settings-session-label">OPEN_TABS</span>
                        <span className="settings-session-value">{sessionState.tabCount}</span>
                      </div>
                      <div className="settings-session-item">
                        <span className="settings-session-label">ACTIVE_TAB</span>
                        <span className="settings-session-value">{sessionState.activeTabName ?? 'NONE'}</span>
                      </div>
                      <div className="settings-session-item">
                        <span className="settings-session-label">VIEW_MODE</span>
                        <span className="settings-session-value">{sessionState.viewMode.toUpperCase()}</span>
                      </div>
                      <div className="settings-session-item">
                        <span className="settings-session-label">APP_MODE</span>
                        <span className="settings-session-value">{sessionState.appMode.toUpperCase()}</span>
                      </div>
                      <div className="settings-session-item">
                        <span className="settings-session-label">ZOOM_SCALE</span>
                        <span className="settings-session-value">{sessionState.zoom.toFixed(2)}x</span>
                      </div>
                    </div>
                  </div>

                  <div className="settings-card settings-card-highlight bg-[var(--bg-inset)]">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="font-bold text-[11px] uppercase flex items-center gap-2">
                          <Save size={14} /> AUTO_SAVE
                        </span>
                        <p className="text-[11px] text-[var(--fg-muted)] leading-relaxed mt-2">
                          Toggle instant persistence to local storage while editing.
                        </p>
                      </div>
                      <label className="pwa-toggle">
                        <input
                          type="checkbox"
                          checked={sessionState.autoSaveEnabled}
                          onChange={(event) => onAutoSaveToggle(event.target.checked)}
                        />
                        <span className="pwa-toggle-indicator" />
                      </label>
                    </div>
                  </div>

                  <div className="settings-card settings-card-highlight bg-[var(--bg-inset)]">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="font-bold text-[11px] uppercase flex items-center gap-2">
                          <Monitor size={14} /> RESTORE_SESSION
                        </span>
                        <p className="text-[11px] text-[var(--fg-muted)] leading-relaxed mt-2">
                          Persist current project, tabs, and layout so reloads resume from the last session.
                        </p>
                      </div>
                      <label className="pwa-toggle">
                        <input
                          type="checkbox"
                          checked={sessionState.persistSessionEnabled}
                          onChange={(event) => onPersistSessionToggle(event.target.checked)}
                        />
                        <span className="pwa-toggle-indicator" />
                      </label>
                    </div>
                  </div>
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
