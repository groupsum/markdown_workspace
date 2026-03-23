import React from 'react';
import type { ClientRuntimeBridge, ClientRuntimeServices } from './clientRuntimeTypes';
import { OidcSignInSelector } from '../../../components/Modals/OidcSignInSelector';
import { RepositoryAutocomplete } from '../../../components/Modals/RepositoryAutocomplete';
import { THEMES } from '../../../data/themes';
import { CommandPaletteView } from '../../shell/CommandPaletteView';
import { SettingsView } from '../../shell/SettingsView';

const label = (defaultMessage: string, key?: string) => ({ defaultMessage, key });

export function useCoreSurfaceRegistrations(runtime: ClientRuntimeBridge, services: ClientRuntimeServices): void {
  React.useEffect(() => {
    services.i18n.registerCatalog({
      locale: 'en',
      messages: {
        'core.command-palette.title': 'Command Palette',
        'core.settings.title': 'System Configuration',
        'core.git.title': 'Git Operations',
      },
    });

    const commandDisposables = [
      services.commands.register({
        id: 'core.new-file',
        title: label('Create New File'),
        execute: () => runtime.getSnapshot().app.actions.promptNewFile(),
        icon: { kind: 'lucide', name: 'FilePlus' },
        keywords: ['file', 'create', 'new'],
      }),
      services.commands.register({
        id: 'core.new-folder',
        title: label('Create New Folder'),
        execute: () => runtime.getSnapshot().app.actions.promptNewFolder(),
        icon: { kind: 'lucide', name: 'FolderPlus' },
        keywords: ['folder', 'create', 'new'],
      }),
      services.commands.register({
        id: 'core.save-current-file',
        title: label('Save Current File'),
        execute: () => runtime.getSnapshot().app.actions.saveCurrentFile(),
        icon: { kind: 'lucide', name: 'Save' },
        keywords: ['save', 'write'],
      }),
      services.commands.register({
        id: 'core.rename-selected',
        title: label('Rename Selected Item'),
        execute: () => runtime.getSnapshot().app.actions.promptRenameSelected(),
        icon: { kind: 'lucide', name: 'Pencil' },
      }),
      services.commands.register({
        id: 'core.delete-selected',
        title: label('Delete Selected Item'),
        execute: () => runtime.getSnapshot().app.actions.deleteSelectedItem(),
        icon: { kind: 'lucide', name: 'Trash2' },
      }),
      services.commands.register({
        id: 'core.toggle-explorer',
        title: label('Toggle Explorer'),
        execute: () => runtime.getSnapshot().app.actions.toggleSidebar(),
        icon: { kind: 'lucide', name: 'Folder' },
      }),
      services.commands.register({
        id: 'core.download-workspace',
        title: label('Download Workspace'),
        execute: () => runtime.getSnapshot().app.actions.handleDownload(),
        icon: { kind: 'lucide', name: 'Download' },
      }),
      services.commands.register({
        id: 'core.export-html',
        title: label('Export HTML'),
        execute: () => runtime.getSnapshot().app.actions.handleHtmlExport(),
        icon: { kind: 'lucide', name: 'FileDown' },
      }),
      services.commands.register({
        id: 'core.print-preview',
        title: label('Print Preview'),
        execute: () => runtime.getSnapshot().app.actions.handlePrint(),
        icon: { kind: 'lucide', name: 'Printer' },
      }),
      services.commands.register({
        id: 'core.toggle-git-pane',
        title: label('Toggle Git Operations'),
        execute: async () => {
          const { app } = runtime.getSnapshot();
          if (app.state.appMode === 'git') {
            await services.views.close('core.git-pane');
          } else {
            await services.views.open('core.git-pane');
          }
        },
        icon: { kind: 'lucide', name: 'GitBranch' },
      }),
      services.commands.register({
        id: 'core.switch-project',
        title: label('Switch Project'),
        execute: () => runtime.getSnapshot().app.actions.switchToProjectSelector(),
        icon: { kind: 'lucide', name: 'LayoutGrid' },
      }),
      services.commands.register({
        id: 'core.open-settings',
        title: label('System Settings'),
        execute: () => services.views.open('core.settings'),
        icon: { kind: 'lucide', name: 'Settings' },
      }),
      services.commands.register({
        id: 'core.open-command-palette',
        title: label('Open Command Palette'),
        execute: () => services.views.open('core.command-palette'),
        icon: { kind: 'lucide', name: 'Command' },
      }),
      services.commands.register({
        id: 'core.zoom-in',
        title: label('Zoom In'),
        execute: () => runtime.getSnapshot().app.actions.adjustZoom(0.1),
        icon: { kind: 'lucide', name: 'Plus' },
      }),
      services.commands.register({
        id: 'core.zoom-out',
        title: label('Zoom Out'),
        execute: () => runtime.getSnapshot().app.actions.adjustZoom(-0.1),
        icon: { kind: 'lucide', name: 'Minus' },
      }),
      services.commands.register({
        id: 'core.zoom-reset',
        title: label('Reset Zoom'),
        execute: () => runtime.getSnapshot().app.actions.setZoom(1),
        icon: { kind: 'lucide', name: 'Monitor' },
      }),
      services.commands.register({
        id: 'core.view-editor',
        title: label('Editor View'),
        execute: () => runtime.getSnapshot().app.actions.setViewMode('editor'),
        icon: { kind: 'lucide', name: 'LayoutGrid' },
      }),
      services.commands.register({
        id: 'core.view-split',
        title: label('Split View'),
        execute: () => runtime.getSnapshot().app.actions.setViewMode('split'),
        icon: { kind: 'lucide', name: 'Columns' },
      }),
      services.commands.register({
        id: 'core.view-preview',
        title: label('Preview View'),
        execute: () => runtime.getSnapshot().app.actions.setViewMode('preview'),
        icon: { kind: 'lucide', name: 'Eye' },
      }),
      services.commands.register({
        id: 'core.next-tab',
        title: label('Next Tab'),
        execute: () => runtime.getSnapshot().app.actions.selectNextTab(),
        icon: { kind: 'lucide', name: 'ArrowRight' },
      }),
      services.commands.register({
        id: 'core.previous-tab',
        title: label('Previous Tab'),
        execute: () => runtime.getSnapshot().app.actions.selectPreviousTab(),
        icon: { kind: 'lucide', name: 'ArrowRight' },
      }),
      services.commands.register({
        id: 'core.focus-explorer',
        title: label('Focus Explorer'),
        execute: () => {
          runtime.getSnapshot().app.actions.setSidebarOpen(true);
          requestAnimationFrame(() => {
            const explorer = document.querySelector<HTMLElement>('.file-tree-container');
            explorer?.focus();
          });
        },
        icon: { kind: 'lucide', name: 'Folder' },
      }),
      services.commands.register({
        id: 'core.cloud-sync',
        title: label('Cloud Sync (Mock)'),
        execute: () => runtime.getSnapshot().app.actions.addToast('SYNC: CLOUD UNREACHABLE', 'warning'),
        icon: { kind: 'lucide', name: 'Cloud' },
      }),
    ];

    const viewDisposables = [
      services.views.register({
        id: 'core.command-palette',
        title: label('Command Palette', 'core.command-palette.title'),
        description: label('Search files and execute commands.'),
        location: 'modal',
        canBePinned: false,
        allowMultiple: false,
        render: () => <CommandPaletteView />,
        onOpen: () => runtime.getSnapshot().app.actions.setShowPalette(true),
        onClose: () => runtime.getSnapshot().app.actions.setShowPalette(false),
      }),
      services.views.register({
        id: 'core.settings',
        title: label('System Configuration', 'core.settings.title'),
        description: label('Application and workspace settings.'),
        location: 'modal',
        canBePinned: false,
        allowMultiple: false,
        render: () => <SettingsView />,
        onOpen: () => runtime.getSnapshot().app.actions.setShowSettings(true),
        onClose: () => runtime.getSnapshot().app.actions.setShowSettings(false),
      }),
      services.views.register({
        id: 'core.git-pane',
        title: label('Git Operations', 'core.git.title'),
        description: label('Source control workspace.'),
        location: 'main',
        canBePinned: true,
        allowMultiple: false,
        render: () => null,
        onOpen: () => runtime.getSnapshot().app.actions.setAppMode('git'),
        onClose: () => runtime.getSnapshot().app.actions.setAppMode('work'),
      }),
    ];

    const railDisposables = [
      services.actionRail.register({
        id: 'core.toggle-explorer',
        title: label('Toggle Explorer'),
        icon: { kind: 'lucide', name: 'Folder' },
        group: 'workspace.primary',
        order: 10,
        target: { kind: 'command', commandId: 'core.toggle-explorer' },
        isActive: () => {
          const snapshot = runtime.getSnapshot();
          return snapshot.app.state.sidebarOpen && snapshot.app.state.appMode === 'work';
        },
      }),
      services.actionRail.register({
        id: 'core.new-file',
        title: label('New File'),
        icon: { kind: 'lucide', name: 'FilePlus' },
        group: 'workspace.primary',
        order: 20,
        target: { kind: 'command', commandId: 'core.new-file' },
      }),
      services.actionRail.register({
        id: 'core.new-folder',
        title: label('New Folder'),
        icon: { kind: 'lucide', name: 'FolderPlus' },
        group: 'workspace.primary',
        order: 30,
        target: { kind: 'command', commandId: 'core.new-folder' },
      }),
      services.actionRail.register({
        id: 'core.git-pane-rail',
        title: label('Git Operations'),
        icon: { kind: 'lucide', name: 'GitBranch' },
        group: 'workspace.primary',
        order: 40,
        target: { kind: 'view', viewId: 'core.git-pane' },
        isActive: () => runtime.getSnapshot().app.state.appMode === 'git',
      }),
      services.actionRail.register({
        id: 'core.switch-project',
        title: label('Switch Project'),
        icon: { kind: 'lucide', name: 'LayoutGrid' },
        group: 'workspace.secondary',
        order: 10,
        target: { kind: 'command', commandId: 'core.switch-project' },
      }),
      services.actionRail.register({
        id: 'core.download-workspace',
        title: label('Download Workspace'),
        icon: { kind: 'lucide', name: 'Download' },
        group: 'workspace.secondary',
        order: 20,
        target: { kind: 'command', commandId: 'core.download-workspace' },
      }),
      services.actionRail.register({
        id: 'core.export-html',
        title: label('Export HTML'),
        icon: { kind: 'lucide', name: 'FileDown' },
        group: 'workspace.secondary',
        order: 30,
        target: { kind: 'command', commandId: 'core.export-html' },
      }),
      services.actionRail.register({
        id: 'core.print-preview',
        title: label('Print Preview'),
        icon: { kind: 'lucide', name: 'Printer' },
        group: 'workspace.secondary',
        order: 40,
        target: { kind: 'command', commandId: 'core.print-preview' },
      }),
      services.actionRail.register({
        id: 'core.cloud-sync',
        title: label('Cloud Sync (Mock)'),
        icon: { kind: 'lucide', name: 'Cloud' },
        group: 'system',
        order: 10,
        target: { kind: 'command', commandId: 'core.cloud-sync' },
      }),
    ];

    const settingsDisposables = [
      services.settingsRegistry.register({
        id: 'core.settings.visual',
        title: label('Visual Matrix'),
        description: label('Theme presets and visual surfaces.'),
        order: 10,
        panel: 'visual',
        icon: { kind: 'lucide', name: 'Layout' },
        render: () => {
          const snapshot = runtime.getSnapshot();
          const currentTheme = snapshot.app.state.theme;
          const themeIndex = Math.max(THEMES.findIndex((theme) => theme.id === currentTheme), 0);
          const themeDef = THEMES[themeIndex];
          const handleThemeStep = (direction: number) => {
            const nextIndex = (themeIndex + direction + THEMES.length) % THEMES.length;
            void snapshot.app.actions.setTheme(THEMES[nextIndex].id);
          };
          return (
            <div className="settings-pane">
              <div className="settings-grid-2">
                {THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => void snapshot.app.actions.setTheme(theme.id)}
                    className={`settings-theme-btn ${currentTheme === theme.id ? 'active' : ''}`}
                  >
                    <div className="settings-theme-header">
                      <span className={currentTheme === theme.id ? 'text-[var(--accent)]' : 'text-[var(--fg-muted)]'}>{theme.icon}</span>
                      <span className="settings-theme-name">{theme.name}</span>
                    </div>
                    <span className="settings-theme-desc">{theme.description}</span>
                    <span className="text-[10px] uppercase text-[var(--fg-muted)]">CODE_SYNTAX • {theme.syntaxTheme.name}</span>
                    <span className="text-[11px] text-[var(--fg-muted)]">{theme.syntaxTheme.palette}</span>
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
                  <button type="button" className="settings-theme-action-btn" onClick={() => handleThemeStep(-1)}>PREV_THEME</button>
                  <button type="button" className="settings-theme-action-btn settings-theme-action-btn-primary" onClick={() => handleThemeStep(1)}>NEXT_THEME</button>
                </div>
              </div>
            </div>
          );
        },
      }),
      services.settingsRegistry.register({
        id: 'core.settings.git',
        title: label('Source Control'),
        description: label('Repository and identity settings.'),
        order: 20,
        panel: 'git',
        icon: { kind: 'lucide', name: 'GitBranch' },
        render: () => {
          const snapshot = runtime.getSnapshot();
          const gitConfig = snapshot.app.actions.getActiveGitConfig();
          const handleGitChange = (key: keyof typeof gitConfig, value: string) => {
            void snapshot.app.actions.handleGitConfigUpdate({ ...gitConfig, [key]: value });
          };
          return (
            <div className="settings-pane">
              <div className="settings-card settings-card-stack">
                <div className="flex flex-col gap-4">
                  <OidcSignInSelector
                    gitConfig={gitConfig}
                    onGitConfigChange={snapshot.app.actions.handleGitConfigUpdate}
                    onOidcSignIn={snapshot.app.actions.handleOidcSignIn}
                  />
                  <RepositoryAutocomplete
                    projectId={snapshot.app.state.activeProjectId}
                    gitConfig={gitConfig}
                    onRepoUrlChange={(value) => handleGitChange('repoUrl', value)}
                    onGitConfigChange={snapshot.app.actions.handleGitConfigUpdate}
                  />
                  <label className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-[var(--fg-muted)]">BRANCH</span>
                    <input
                      className="modal-input !text-xs !py-3"
                      value={gitConfig.branch}
                      onChange={(event) => handleGitChange('branch', event.target.value)}
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
          );
        },
      }),
      services.settingsRegistry.register({
        id: 'core.settings.data',
        title: label('Storage Ops'),
        description: label('PWA deployment and export controls.'),
        order: 30,
        panel: 'data',
        icon: { kind: 'lucide', name: 'Database' },
        render: () => {
          const snapshot = runtime.getSnapshot();
          const pwaState = snapshot.pwa.state;
          const pwaActions = snapshot.pwa.actions;
          const pwaStatusLabel = pwaState.isInstalled ? 'INSTALLED' : 'NOT_INSTALLED';
          const pwaUpdateLabel = pwaState.updateAvailable ? 'UPDATE_READY' : 'UP_TO_DATE';
          return (
            <div className="settings-pane">
              <div className="flex flex-col gap-4">
                <div className="settings-card settings-card-highlight bg-[var(--bg-inset)]">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-[11px] uppercase">PWA_DEPLOYMENT</span>
                    <span className="text-[9px] px-2 py-0.5 border border-[var(--border-color)] bg-black text-white">{pwaStatusLabel}</span>
                  </div>
                  <p className="text-[11px] text-[var(--fg-muted)] mb-4 leading-relaxed">Manage offline installation and apply background updates without blocking the active session.</p>
                  <div className="pwa-status-grid">
                    <div className="pwa-status-row"><span className="pwa-status-label">UPDATE_STATE</span><span className={`pwa-status-value ${pwaState.updateAvailable ? 'is-ready' : ''}`}>{pwaUpdateLabel}</span></div>
                    <div className="pwa-status-row"><span className="pwa-status-label">SERVICE_WORKER</span><span className="pwa-status-value">{pwaState.isSupported ? 'AVAILABLE' : 'UNAVAILABLE'}</span></div>
                  </div>
                  <div className="settings-action-row">
                    <button className="modal-btn flex-1" onClick={pwaActions.promptInstall} disabled={!pwaState.canInstall}>INSTALL_PWA</button>
                    <button className="modal-btn flex-1 modal-btn-primary" onClick={pwaActions.requestUpdate} disabled={!pwaState.updateAvailable}>APPLY_UPDATE</button>
                  </div>
                  <label className="pwa-toggle">
                    <input type="checkbox" checked={pwaState.autoUpdateEnabled} onChange={(event) => pwaActions.toggleAutoUpdate(event.target.checked)} />
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
                  <button onClick={snapshot.app.actions.exportData} className="modal-btn modal-btn-primary w-full flex items-center justify-center gap-2">EXECUTE_EXPORT</button>
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
          );
        },
      }),
      services.settingsRegistry.register({
        id: 'core.settings.keys',
        title: label('Key Map'),
        description: label('Host keyboard bindings backed by the command registry.'),
        order: 40,
        panel: 'keys',
        icon: { kind: 'lucide', name: 'Keyboard' },
        render: () => (
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
                { label: 'PRINT_PREVIEW', key: 'CTRL/CMD+P' },
              ].map((row) => (
                <div key={row.label} className="settings-keymap-item">
                  <span className="settings-keymap-label text-[var(--fg-muted)]">{row.label}</span>
                  <span className="settings-keymap-key text-[var(--accent)] font-mono">{row.key}</span>
                </div>
              ))}
            </div>
          </div>
        ),
      }),
      services.settingsRegistry.register({
        id: 'core.settings.session',
        title: label('Session State'),
        description: label('Session and persistence controls.'),
        order: 50,
        panel: 'session',
        icon: { kind: 'lucide', name: 'Monitor' },
        render: () => {
          const snapshot = runtime.getSnapshot();
          return (
            <div className="settings-pane">
              <div className="flex flex-col gap-4">
                <div className="settings-card settings-card-stack">
                  <div className="settings-session-grid">
                    <div className="settings-session-item"><span className="settings-session-label">ACTIVE_PROJECT</span><span className="settings-session-value">{snapshot.app.state.currentProject?.name ?? 'NONE'}</span></div>
                    <div className="settings-session-item"><span className="settings-session-label">OPEN_TABS</span><span className="settings-session-value">{snapshot.app.state.tabs.length}</span></div>
                    <div className="settings-session-item"><span className="settings-session-label">ACTIVE_TAB</span><span className="settings-session-value">{snapshot.activeTabName ?? 'NONE'}</span></div>
                    <div className="settings-session-item"><span className="settings-session-label">VIEW_MODE</span><span className="settings-session-value">{snapshot.app.state.viewMode.toUpperCase()}</span></div>
                    <div className="settings-session-item"><span className="settings-session-label">APP_MODE</span><span className="settings-session-value">{snapshot.app.state.appMode.toUpperCase()}</span></div>
                    <div className="settings-session-item"><span className="settings-session-label">ZOOM_SCALE</span><span className="settings-session-value">{snapshot.app.state.zoom.toFixed(2)}x</span></div>
                  </div>
                </div>
                <div className="settings-card settings-card-highlight bg-[var(--bg-inset)]">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="font-bold text-[11px] uppercase flex items-center gap-2">AUTO_SAVE</span>
                      <p className="text-[11px] text-[var(--fg-muted)] leading-relaxed mt-2">Toggle instant persistence to local storage while editing.</p>
                    </div>
                    <label className="pwa-toggle">
                      <input type="checkbox" checked={snapshot.app.state.autoSaveEnabled} onChange={(event) => snapshot.app.actions.setAutoSaveEnabled(event.target.checked)} />
                      <span className="pwa-toggle-indicator" />
                    </label>
                  </div>
                </div>
                <div className="settings-card settings-card-highlight bg-[var(--bg-inset)]">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="font-bold text-[11px] uppercase flex items-center gap-2">RESTORE_SESSION</span>
                      <p className="text-[11px] text-[var(--fg-muted)] leading-relaxed mt-2">Persist current project, tabs, and layout so reloads resume from the last session.</p>
                    </div>
                    <label className="pwa-toggle">
                      <input type="checkbox" checked={snapshot.app.state.persistSessionEnabled} onChange={(event) => snapshot.app.actions.setPersistSessionEnabled(event.target.checked)} />
                      <span className="pwa-toggle-indicator" />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          );
        },
      }),
    ];

    return () => {
      [...settingsDisposables, ...railDisposables, ...viewDisposables, ...commandDisposables].forEach((disposable) => disposable.dispose());
    };
  }, [runtime, services]);
}
