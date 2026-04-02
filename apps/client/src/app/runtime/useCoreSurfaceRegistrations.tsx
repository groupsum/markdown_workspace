import React from 'react';
import type { ClientRuntimeBridge, ClientRuntimeServices } from './clientRuntimeTypes';
import { THEMES } from '../../../data/themes';
import { MarkdownProfileSettingsPanel } from '../../features/markdownProfiles/MarkdownProfileSettingsPanel';
import { LanguageSettingsPanel } from '../../features/i18n/LanguageSettingsPanel';
import { GIT_REPO_REFRESH_REQUEST_EVENT } from '../../../constants';
import { GitSettingsPanel } from '../../features/settings/GitSettingsPanel';
import { DataSettingsPanel } from '../../features/settings/DataSettingsPanel';
import { CommandPaletteView } from '../../shell/CommandPaletteView';
import { SettingsView } from '../../shell/SettingsView';
import { LanguagePackManagerPanel } from '../../features/i18n/LanguagePackManagerPanel';
import { WorkspacePreferencesPanel } from '../../features/preferences/WorkspacePreferencesPanel';

const label = (defaultMessage: string, key?: string) => ({ defaultMessage, key });

export function useCoreSurfaceRegistrations(runtime: ClientRuntimeBridge, services: ClientRuntimeServices): void {
  React.useEffect(() => {
    services.i18n.registerCatalog({
      locale: 'en',
      messages: {
        'core.command-palette.title': 'Command Palette',
        'core.command-palette.description': 'Search files and execute commands.',
        'core.views.settings.title': 'System Configuration',
        'core.views.settings.description': 'Application and workspace settings.',
        'core.views.git.title': 'Git Operations',
        'core.views.git.description': 'Source control workspace.',
        'core.action-rail.aria-label': 'Primary Actions',
        'core.import-markdown.title': 'Import Markdown',
        'core.settings.visual.title': 'Visual Matrix',
        'core.settings.visual.description': 'Theme presets and visual surfaces.',
        'core.settings.visual.active-theme': 'ACTIVE_THEME',
        'core.settings.markdown-profiles.title': 'Markdown Profiles',
        'core.settings.markdown-profiles.description': 'Optional Markdown feature profiles and trust policy.',
        'core.settings.sections.git.title': 'Source Control',
        'core.settings.sections.git.description': 'Repository and identity settings.',
        'core.settings.sections.data.title': 'Storage Ops',
        'core.settings.sections.data.description': 'PWA deployment and export controls.',
        'core.settings.sections.keymap.title': 'Key Map',
        'core.settings.sections.keymap.description': 'Host keyboard bindings backed by the command registry.',
        'core.settings.sections.session.title': 'Session State',
        'core.settings.sections.session.description': 'Session and persistence controls.',
        'core.settings.sidebar.core.settings.markdown-profiles.label': 'MARKDOWN_PROFILES',
        'core.settings.sidebar.core.settings.extensions.runtime.label': 'EXTENSION_RUNTIME',
        'core.settings.sidebar.@mdwrk/extension-manager.settings.label': 'EXTENSION_MANAGER',
        'core.settings.sidebar.@mdwrk/extension-theme-studio.settings.label': 'THEME_STUDIO_SETTINGS',
        'core.settings.sidebar.core.settings.git.label': 'SOURCE_CONTROL',
        'core.settings.sidebar.core.settings.data.label': 'STORAGE_OPS',
        'core.settings.sidebar.core.settings.keys.label': 'KEY_MAP',
        'core.settings.sidebar.core.settings.language.label': 'LANGUAGE_&_LOCALE',
        'core.settings.sidebar.core.settings.session.label': 'SESSION_STATE',
        'core.settings.sidebar.core.settings.visual.label': 'VISUAL_MATRIX',
        'core.commands.new-file': 'Create New File',
        'core.commands.new-folder': 'Create New Folder',
        'core.commands.save-current-file': 'Save Current File',
        'core.commands.rename-selected': 'Rename Selected Item',
        'core.commands.delete-selected': 'Delete Selected Item',
        'core.commands.toggle-explorer': 'Toggle Explorer',
        'core.commands.download-workspace': 'Download Workspace',
        'core.commands.export-html': 'Export HTML',
        'core.commands.print-preview': 'Print Preview',
        'core.commands.toggle-git-pane': 'Toggle Git Operations',
        'core.commands.switch-project': 'Switch Project',
        'core.commands.open-settings': 'System Settings',
        'core.commands.open-command-palette': 'Open Command Palette',
        'core.commands.zoom-in': 'Zoom In',
        'core.commands.zoom-out': 'Zoom Out',
        'core.commands.zoom-reset': 'Reset Zoom',
        'core.commands.view-editor': 'Editor View',
        'core.commands.view-split': 'Split View',
        'core.commands.view-preview': 'Preview View',
        'core.commands.next-tab': 'Next Tab',
        'core.commands.previous-tab': 'Previous Tab',
        'core.commands.focus-explorer': 'Focus Explorer',
        'core.commands.cloud-sync': 'Cloud Sync (Mock)',
      },
    });

    const commandDisposables = [
      services.commands.register({
        id: 'core.new-file',
        title: label('Create New File', 'core.commands.new-file'),
        execute: () => runtime.getSnapshot().app.actions.promptNewFile(),
        icon: { kind: 'lucide', name: 'FilePlus' },
        keywords: ['file', 'create', 'new'],
      }),
      services.commands.register({
        id: 'core.new-folder',
        title: label('Create New Folder', 'core.commands.new-folder'),
        execute: () => runtime.getSnapshot().app.actions.promptNewFolder(),
        icon: { kind: 'lucide', name: 'FolderPlus' },
        keywords: ['folder', 'create', 'new'],
      }),
      services.commands.register({
        id: 'core.save-current-file',
        title: label('Save Current File', 'core.commands.save-current-file'),
        execute: () => runtime.getSnapshot().app.actions.saveCurrentFile(),
        icon: { kind: 'lucide', name: 'Save' },
        keywords: ['save', 'write'],
      }),
      services.commands.register({
        id: 'core.rename-selected',
        title: label('Rename Selected Item', 'core.commands.rename-selected'),
        execute: () => runtime.getSnapshot().app.actions.promptRenameSelected(),
        icon: { kind: 'lucide', name: 'Pencil' },
      }),
      services.commands.register({
        id: 'core.delete-selected',
        title: label('Delete Selected Item', 'core.commands.delete-selected'),
        execute: () => runtime.getSnapshot().app.actions.deleteSelectedItem(),
        icon: { kind: 'lucide', name: 'Trash2' },
      }),
      services.commands.register({
        id: 'core.toggle-explorer',
        title: label('Toggle Explorer', 'core.commands.toggle-explorer'),
        execute: () => runtime.getSnapshot().app.actions.toggleSidebar(),
        icon: { kind: 'lucide', name: 'Folder' },
      }),
      services.commands.register({
        id: 'core.download-workspace',
        title: label('Download Workspace', 'core.commands.download-workspace'),
        execute: () => runtime.getSnapshot().app.actions.handleDownload(),
        icon: { kind: 'lucide', name: 'Download' },
      }),
      services.commands.register({
        id: 'core.export-html',
        title: label('Export HTML', 'core.commands.export-html'),
        execute: () => runtime.getSnapshot().app.actions.handleHtmlExport(),
        icon: { kind: 'lucide', name: 'FileDown' },
      }),
      services.commands.register({
        id: 'core.print-preview',
        title: label('Print Preview', 'core.commands.print-preview'),
        execute: () => runtime.getSnapshot().app.actions.handlePrint(),
        icon: { kind: 'lucide', name: 'Printer' },
      }),
      services.commands.register({
        id: 'core.import-markdown',
        title: label('Import Markdown', 'core.import-markdown.title'),
        execute: () => runtime.getSnapshot().app.actions.requestMarkdownImport(),
        icon: { kind: 'lucide', name: 'Upload' },
        keywords: ['import', 'markdown', 'upload'],
      }),
      services.commands.register({
        id: 'core.toggle-git-pane',
        title: label('Toggle Git Operations', 'core.commands.toggle-git-pane'),
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
        title: label('Switch Project', 'core.commands.switch-project'),
        execute: () => runtime.getSnapshot().app.actions.switchToProjectSelector(),
        icon: { kind: 'lucide', name: 'LayoutGrid' },
      }),
      services.commands.register({
        id: 'core.open-settings',
        title: label('System Settings', 'core.commands.open-settings'),
        execute: () => services.views.open('core.settings'),
        icon: { kind: 'lucide', name: 'Settings' },
      }),
      services.commands.register({
        id: 'core.open-command-palette',
        title: label('Open Command Palette', 'core.commands.open-command-palette'),
        execute: () => services.views.open('core.command-palette'),
        icon: { kind: 'lucide', name: 'Command' },
      }),
      services.commands.register({
        id: 'core.zoom-in',
        title: label('Zoom In', 'core.commands.zoom-in'),
        execute: () => runtime.getSnapshot().app.actions.adjustZoom(0.1),
        icon: { kind: 'lucide', name: 'Plus' },
      }),
      services.commands.register({
        id: 'core.zoom-out',
        title: label('Zoom Out', 'core.commands.zoom-out'),
        execute: () => runtime.getSnapshot().app.actions.adjustZoom(-0.1),
        icon: { kind: 'lucide', name: 'Minus' },
      }),
      services.commands.register({
        id: 'core.zoom-reset',
        title: label('Reset Zoom', 'core.commands.zoom-reset'),
        execute: () => runtime.getSnapshot().app.actions.setZoom(1),
        icon: { kind: 'lucide', name: 'Monitor' },
      }),
      services.commands.register({
        id: 'core.view-editor',
        title: label('Editor View', 'core.commands.view-editor'),
        execute: () => runtime.getSnapshot().app.actions.setViewMode('editor'),
        icon: { kind: 'lucide', name: 'LayoutGrid' },
      }),
      services.commands.register({
        id: 'core.view-split',
        title: label('Split View', 'core.commands.view-split'),
        execute: () => runtime.getSnapshot().app.actions.setViewMode('split'),
        icon: { kind: 'lucide', name: 'Columns' },
      }),
      services.commands.register({
        id: 'core.view-preview',
        title: label('Preview View', 'core.commands.view-preview'),
        execute: () => runtime.getSnapshot().app.actions.setViewMode('preview'),
        icon: { kind: 'lucide', name: 'Eye' },
      }),
      services.commands.register({
        id: 'core.next-tab',
        title: label('Next Tab', 'core.commands.next-tab'),
        execute: () => runtime.getSnapshot().app.actions.selectNextTab(),
        icon: { kind: 'lucide', name: 'ArrowRight' },
      }),
      services.commands.register({
        id: 'core.previous-tab',
        title: label('Previous Tab', 'core.commands.previous-tab'),
        execute: () => runtime.getSnapshot().app.actions.selectPreviousTab(),
        icon: { kind: 'lucide', name: 'ArrowRight' },
      }),
      services.commands.register({
        id: 'core.focus-explorer',
        title: label('Focus Explorer', 'core.commands.focus-explorer'),
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
        title: label('Cloud Sync (Mock)', 'core.commands.cloud-sync'),
        execute: () => {
          void services.views.open('core.settings', { sectionId: 'core.settings.git' });
          window.dispatchEvent(new CustomEvent(GIT_REPO_REFRESH_REQUEST_EVENT));
          runtime.getSnapshot().app.actions.addToast('OPENED GITHUB CONFIGURATION', 'info');
        },
        icon: { kind: 'lucide', name: 'Cloud' },
      }),
    ];

    const viewDisposables = [
      services.views.register({
        id: 'core.command-palette',
        title: label('Command Palette', 'core.command-palette.title'),
        description: label('Search files and execute commands.', 'core.command-palette.description'),
        location: 'modal',
        canBePinned: false,
        allowMultiple: false,
        render: () => <CommandPaletteView />,
        onOpen: () => runtime.getSnapshot().app.actions.setShowPalette(true),
        onClose: () => runtime.getSnapshot().app.actions.setShowPalette(false),
      }),
      services.views.register({
        id: 'core.settings',
        title: label('System Configuration', 'core.views.settings.title'),
        description: label('Application and workspace settings.', 'core.views.settings.description'),
        location: 'modal',
        canBePinned: false,
        allowMultiple: false,
        render: () => <SettingsView />,
        onOpen: () => runtime.getSnapshot().app.actions.setShowSettings(true),
        onClose: () => runtime.getSnapshot().app.actions.setShowSettings(false),
      }),
      services.views.register({
        id: 'core.git-pane',
        title: label('Git Operations', 'core.views.git.title'),
        description: label('Source control workspace.', 'core.views.git.description'),
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
        title: label('Toggle Explorer', 'core.commands.toggle-explorer'),
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
        target: { kind: 'command', commandId: 'core.toggle-git-pane' },
        isActive: () => runtime.getSnapshot().app.state.appMode === 'git',
      }),
      services.actionRail.register({
        id: 'core.switch-project',
        title: label('Switch Project', 'core.commands.switch-project'),
        icon: { kind: 'lucide', name: 'LayoutGrid' },
        group: 'workspace.secondary',
        order: 10,
        target: { kind: 'command', commandId: 'core.switch-project' },
      }),
      services.actionRail.register({
        id: 'core.download-workspace',
        title: label('Download Workspace', 'core.commands.download-workspace'),
        icon: { kind: 'lucide', name: 'Download' },
        group: 'workspace.secondary',
        order: 20,
        target: { kind: 'command', commandId: 'core.download-workspace' },
      }),
      services.actionRail.register({
        id: 'core.export-html',
        title: label('Export HTML', 'core.commands.export-html'),
        icon: { kind: 'lucide', name: 'FileDown' },
        group: 'workspace.secondary',
        order: 30,
        target: { kind: 'command', commandId: 'core.export-html' },
      }),
      services.actionRail.register({
        id: 'core.import-markdown',
        title: label('Import Markdown', 'core.import-markdown.title'),
        icon: { kind: 'lucide', name: 'Upload' },
        group: 'workspace.secondary',
        order: 35,
        target: { kind: 'command', commandId: 'core.import-markdown' },
      }),
      services.actionRail.register({
        id: 'core.print-preview',
        title: label('Print Preview', 'core.commands.print-preview'),
        icon: { kind: 'lucide', name: 'Printer' },
        group: 'workspace.secondary',
        order: 40,
        target: { kind: 'command', commandId: 'core.print-preview' },
      }),
      services.actionRail.register({
        id: 'core.cloud-sync',
        title: label('Cloud Sync (Mock)', 'core.commands.cloud-sync'),
        icon: { kind: 'lucide', name: 'Cloud' },
        group: 'system',
        order: 10,
        target: { kind: 'command', commandId: 'core.cloud-sync' },
      }),
    ];

    const settingsDisposables = [
      services.settingsRegistry.register({
        id: 'core.settings.visual',
        title: label('Visual Matrix', 'core.settings.visual.title'),
        description: label('Theme presets and visual surfaces.', 'core.settings.visual.description'),
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
        id: 'core.settings.markdown-profiles',
        title: label('Markdown Profiles', 'core.markdown-profiles.title'),
        description: label('Optional Markdown feature profiles and trust policy.', 'core.settings.markdown-profiles.description'),
        order: 15,
        panel: 'advanced',
        icon: { kind: 'lucide', name: 'FileText' },
        render: () => <MarkdownProfileSettingsPanel />,
      }),
      services.settingsRegistry.register({
        id: 'core.settings.git',
        title: label('Source Control', 'core.settings.sections.git.title'),
        description: label('Repository and identity settings.', 'core.settings.sections.git.description'),
        order: 20,
        panel: 'git',
        icon: { kind: 'lucide', name: 'GitBranch' },
        render: () => <GitSettingsPanel />,
      }),
      services.settingsRegistry.register({
        id: 'core.settings.data',
        title: label('Storage Ops', 'core.settings.sections.data.title'),
        description: label('PWA deployment and export controls.', 'core.settings.sections.data.description'),
        order: 30,
        panel: 'data',
        icon: { kind: 'lucide', name: 'Database' },
        render: () => <DataSettingsPanel />,
      }),
      services.settingsRegistry.register({
        id: 'core.settings.language',
        title: label('Language & Locale', 'core.settings.language.title'),
        description: label('Select the interface language used by the core shell.', 'core.settings.language.description'),
        order: 35,
        panel: 'language',
        icon: { kind: 'lucide', name: 'Languages' },
        render: () => <LanguageSettingsPanel />,
      }),
      services.settingsRegistry.register({
        id: 'core.settings.language-packs',
        title: label('Language Packs'),
        description: label('Import, export, and activate portable language packs.'),
        order: 36,
        panel: 'language',
        icon: { kind: 'lucide', name: 'Languages' },
        render: () => <LanguagePackManagerPanel />,
      }),
      services.settingsRegistry.register({
        id: 'core.settings.keys',
        title: label('Key Map', 'core.settings.sections.keymap.title'),
        description: label('Host keyboard bindings backed by the command registry.', 'core.settings.sections.keymap.description'),
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
        title: label('Session State', 'core.settings.sections.session.title'),
        description: label('Session and persistence controls.', 'core.settings.sections.session.description'),
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
                <div className="settings-card settings-card-highlight bg-[var(--bg-inset)]">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="font-bold text-[11px] uppercase flex items-center gap-2">LINE_NUMBERS</span>
                      <p className="text-[11px] text-[var(--fg-muted)] leading-relaxed mt-2">Show or hide the editor gutter line numbers for the current workspace session.</p>
                    </div>
                    <label className="pwa-toggle">
                      <input type="checkbox" checked={snapshot.app.state.showLineNumbers} onChange={(event) => snapshot.app.actions.setShowLineNumbers(event.target.checked)} />
                      <span className="pwa-toggle-indicator" />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          );
        },
      }),
      services.settingsRegistry.register({
        id: 'core.settings.workspace-preferences',
        title: label('Workspace Preferences'),
        description: label('Configure rails, editor toolbar visibility, and export/print policy display.'),
        order: 60,
        panel: 'session',
        icon: { kind: 'lucide', name: 'SlidersHorizontal' },
        render: () => <WorkspacePreferencesPanel />,
      }),
    ];

    return () => {
      [...settingsDisposables, ...railDisposables, ...viewDisposables, ...commandDisposables].forEach((disposable) => disposable.dispose());
    };
  }, [runtime, services]);
}
