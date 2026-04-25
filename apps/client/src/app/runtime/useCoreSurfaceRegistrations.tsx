import React from 'react';
import type { ClientRuntimeBridge, ClientRuntimeServices } from './clientRuntimeTypes';
import { THEMES } from '../../../data/themes';
import { MarkdownProfileSettingsPanel } from '../../features/markdownProfiles/MarkdownProfileSettingsPanel';
import { LanguageSettingsPanel } from '../../features/i18n/LanguageSettingsPanel';
import { GIT_REPO_REFRESH_REQUEST_EVENT } from '../../../constants';
import { DataSettingsPanel } from '../../features/settings/DataSettingsPanel';
import { CommandPaletteView } from '../../shell/CommandPaletteView';
import { SettingsView } from '../../shell/SettingsView';
import { LanguagePackManagerPanel } from '../../features/i18n/LanguagePackManagerPanel';
import { WorkspacePreferencesPanel } from '../../features/preferences/WorkspacePreferencesPanel';

const label = (defaultMessage: string, key?: string) => ({ defaultMessage, key });

export function useCoreSurfaceRegistrations(runtime: ClientRuntimeBridge, services: ClientRuntimeServices): void {
  React.useEffect(() => {
    const t = (key: string, defaultMessage: string) => services.i18n.format({ key, defaultMessage });
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
        'core.preview.policy.title': 'Preview Policy',
        'core.preview.policy.htmlHandling': 'HTML handling',
        'core.export.policy.title': 'Export Policy',
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
        'core.commands.cloud-sync': 'GitHub Configurations',
        'core.commands.open-host-file': 'Open Markdown File',
      },
    });

    const commandDisposables = [
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
        id: 'core.cloud-sync',
        title: label('GitHub Configurations', 'core.commands.cloud-sync'),
        execute: () => {
          void services.views.open('core.settings', { sectionId: 'core.settings.git' });
          window.dispatchEvent(new CustomEvent(GIT_REPO_REFRESH_REQUEST_EVENT));
          runtime.getSnapshot().app.actions.addToast(t('core.settings.git.opened-configuration', 'OPENED GITHUB CONFIGURATION'), 'info');
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
    ];

    const railDisposables = [
      services.actionRail.register({
        id: 'core.switch-project',
        title: label('Switch Project', 'core.commands.switch-project'),
        icon: { kind: 'lucide', name: 'LayoutGrid' },
        group: 'workspace.secondary',
        order: 10,
        target: { kind: 'command', commandId: 'core.switch-project' },
      }),
      services.actionRail.register({
        id: 'core.cloud-sync',
        title: label('GitHub Configurations', 'core.commands.cloud-sync'),
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
                    <span className="text-[10px] uppercase text-[var(--fg-muted)]">{t('core.settings.visual.code-syntax', 'CODE_SYNTAX')} - {theme.syntaxTheme.name}</span>
                    <span className="text-[11px] text-[var(--fg-muted)]">{theme.syntaxTheme.palette}</span>
                  </button>
                ))}
              </div>
              <div className="settings-theme-controls">
                <div className="settings-theme-meta">
                  <span className="settings-theme-label">{t('core.settings.visual.active-theme', 'ACTIVE_THEME')}</span>
                  <span className="settings-theme-value">{themeDef.name}</span>
                  <span className="settings-theme-count">{themeIndex + 1}/{THEMES.length}</span>
                </div>
                <div className="settings-theme-actions">
                  <button type="button" className="settings-theme-action-btn" onClick={() => handleThemeStep(-1)}>{t('core.settings.visual.prev-theme', 'PREV_THEME')}</button>
                  <button type="button" className="settings-theme-action-btn settings-theme-action-btn-primary" onClick={() => handleThemeStep(1)}>{t('core.settings.visual.next-theme', 'NEXT_THEME')}</button>
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
        title: label('Language Packs', 'core.settings.language-packs.section.title'),
        description: label('Import, export, and activate portable language packs.', 'core.settings.language-packs.section.description'),
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
                { label: t('core.settings.keymap.save-buffer', 'SAVE_BUFFER'), key: 'CTRL/CMD+S' },
                { label: t('core.settings.keymap.command-palette', 'COMMAND_PALETTE'), key: 'CTRL/CMD+K' },
                { label: t('core.settings.keymap.new-file', 'NEW_FILE'), key: 'CTRL/CMD+N' },
                { label: t('core.settings.keymap.toggle-workspace-panel', 'TOGGLE_WORKSPACE_PANEL'), key: 'CTRL/CMD+SHIFT+B' },
                { label: t('core.settings.keymap.focus-registry', 'FOCUS_REGISTRY'), key: 'CTRL/CMD+SHIFT+E' },
                { label: t('core.settings.keymap.next-tab', 'NEXT_TAB'), key: 'CTRL/CMD+TAB' },
                { label: t('core.settings.keymap.prev-tab', 'PREV_TAB'), key: 'CTRL/CMD+SHIFT+TAB' },
                { label: t('core.settings.keymap.view-editor', 'VIEW_EDITOR'), key: 'CTRL/CMD+1' },
                { label: t('core.settings.keymap.view-split', 'VIEW_SPLIT'), key: 'CTRL/CMD+2' },
                { label: t('core.settings.keymap.view-preview', 'VIEW_PREVIEW'), key: 'CTRL/CMD+3' },
                { label: t('core.settings.keymap.format-bold', 'FORMAT_BOLD'), key: 'CTRL/CMD+B' },
                { label: t('core.settings.keymap.format-italic', 'FORMAT_ITALIC'), key: 'CTRL/CMD+I' },
                { label: t('core.settings.keymap.format-strikethrough', 'FORMAT_STRIKETHROUGH'), key: 'CTRL/CMD+SHIFT+X' },
                { label: t('core.settings.keymap.undo-op', 'UNDO_OP'), key: 'CTRL/CMD+Z' },
                { label: t('core.settings.keymap.redo-op', 'REDO_OP'), key: 'CTRL/CMD+SHIFT+Z' },
                { label: t('core.settings.keymap.settings', 'SETTINGS'), key: 'CTRL/CMD+,' },
                { label: t('core.settings.keymap.toggle-git-mode', 'TOGGLE_GIT_MODE'), key: 'CTRL/CMD+SHIFT+G' },
                { label: t('core.settings.keymap.zoom-in', 'ZOOM_IN'), key: 'CTRL/CMD++' },
                { label: t('core.settings.keymap.zoom-out', 'ZOOM_OUT'), key: 'CTRL/CMD+-' },
                { label: t('core.settings.keymap.reset-zoom', 'RESET_ZOOM'), key: 'CTRL/CMD+0' },
                { label: t('core.settings.keymap.print-preview', 'PRINT_PREVIEW'), key: 'CTRL/CMD+P' },
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
                    <div className="settings-session-item"><span className="settings-session-label">{t('core.settings.session.active-project', 'ACTIVE_PROJECT')}</span><span className="settings-session-value">{snapshot.app.state.currentProject?.name ?? t('core.settings.state.none', 'NONE')}</span></div>
                    <div className="settings-session-item"><span className="settings-session-label">{t('core.settings.session.open-tabs', 'OPEN_TABS')}</span><span className="settings-session-value">{snapshot.app.state.tabs.length}</span></div>
                    <div className="settings-session-item"><span className="settings-session-label">{t('core.settings.session.active-tab', 'ACTIVE_TAB')}</span><span className="settings-session-value">{snapshot.activeTabName ?? t('core.settings.state.none', 'NONE')}</span></div>
                    <div className="settings-session-item"><span className="settings-session-label">{t('core.settings.session.view-mode', 'VIEW_MODE')}</span><span className="settings-session-value">{snapshot.app.state.viewMode.toUpperCase()}</span></div>
                    <div className="settings-session-item"><span className="settings-session-label">{t('core.settings.session.app-mode', 'APP_MODE')}</span><span className="settings-session-value">{snapshot.app.state.appMode.toUpperCase()}</span></div>
                    <div className="settings-session-item"><span className="settings-session-label">{t('core.settings.session.zoom-scale', 'ZOOM_SCALE')}</span><span className="settings-session-value">{snapshot.app.state.zoom.toFixed(2)}x</span></div>
                  </div>
                </div>
                <div className="settings-card settings-card-highlight bg-[var(--bg-inset)]">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="font-bold text-[11px] uppercase flex items-center gap-2">{t('core.settings.session.auto-save', 'AUTO_SAVE')}</span>
                      <p className="text-[11px] text-[var(--fg-muted)] leading-relaxed mt-2">{t('core.settings.session.auto-save.description', 'Toggle instant persistence to local storage while editing.')}</p>
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
                      <span className="font-bold text-[11px] uppercase flex items-center gap-2">{t('core.settings.session.restore-session', 'RESTORE_SESSION')}</span>
                      <p className="text-[11px] text-[var(--fg-muted)] leading-relaxed mt-2">{t('core.settings.session.restore-session.description', 'Persist current project, tabs, and layout so reloads resume from the last session.')}</p>
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
                      <span className="font-bold text-[11px] uppercase flex items-center gap-2">{t('core.settings.session.line-numbers', 'LINE_NUMBERS')}</span>
                      <p className="text-[11px] text-[var(--fg-muted)] leading-relaxed mt-2">{t('core.settings.session.line-numbers.description', 'Show or hide the editor gutter line numbers for the current workspace session.')}</p>
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
        title: label('Workspace Preferences', 'core.settings.workspace-preferences.section.title'),
        description: label('Configure rails, editor toolbar visibility, and export/print policy display.', 'core.settings.workspace-preferences.section.description'),
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

