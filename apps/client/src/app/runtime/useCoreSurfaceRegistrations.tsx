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
        'core.command-palette.description': 'Find files and run commands.',
        'core.views.settings.title': 'System Configuration',
        'core.views.settings.description': 'App and workspace settings.',
        'core.views.git.title': 'Git Operations',
        'core.views.git.description': 'Source control workspace.',
        'core.action-rail.aria-label': 'Primary Actions',
        'core.import-markdown.title': 'Import Markdown',
        'core.settings.visual.title': 'Visual Matrix',
        'core.settings.visual.description': 'Themes and display styles.',
        'core.settings.visual.active-theme': 'Active theme',
        'core.settings.visual.code-syntax': 'Code syntax',
        'core.settings.visual.prev-theme': 'Previous theme',
        'core.settings.visual.next-theme': 'Next theme',
        'core.settings.markdown-profiles.title': 'Markdown Profiles',
        'core.settings.markdown-profiles.description': 'Markdown modes and HTML trust.',
        'core.settings.language.title': 'Language & Locale',
        'core.settings.language.description': 'Pick the app language.',
        'core.settings.language-packs.section.title': 'Language Packs',
        'core.settings.language-packs.section.description': 'Import, export, and use language packs.',
        'core.settings.state.none': 'None',
        'core.settings.sections.git.title': 'Source Control',
        'core.settings.sections.git.description': 'Repo and identity settings.',
        'core.settings.sections.data.title': 'Storage Ops',
        'core.settings.sections.data.description': 'Storage and export tools.',
        'core.settings.sections.keymap.title': 'Key Map',
        'core.settings.sections.keymap.description': 'Keyboard shortcuts.',
        'core.settings.sections.gestures.title': 'Gesture Map',
        'core.settings.sections.gestures.description': 'Touch mappings for mobile panes and rails.',
        'core.settings.sections.session.title': 'Session State',
        'core.settings.sections.session.description': 'Session and save options.',
        'core.settings.group.general': 'General',
        'core.settings.group.advanced': 'Advanced',
        'core.settings.group.data': 'Data',
        'core.settings.group.extensions': 'Extensions',
        'core.settings.group.git': 'Git',
        'core.settings.group.keys': 'Keys',
        'core.settings.group.language': 'Language',
        'core.settings.group.session': 'Session',
        'core.settings.group.visual': 'Visual',
        'core.settings.sidebar.core.settings.markdown-profiles.label': 'Markdown profiles',
        'core.settings.sidebar.core.settings.extensions.runtime.label': 'Extension runtime',
        'core.settings.sidebar.@mdwrk/extension-manager.settings.label': 'Extension manager',
        'core.settings.sidebar.@mdwrk/extension-theme-studio.settings.label': 'Theme Studio settings',
        'core.settings.sidebar.core.extension-manager.settings.label': 'Extension manager',
        'core.settings.sidebar.core.gemini-agent.settings.label': 'Gemini Agent settings',
        'core.settings.sidebar.core.language-pack-studio.settings.label': 'Language Pack Studio',
        'core.settings.sidebar.core.theme-studio.settings.label': 'Theme Studio settings',
        'core.settings.sidebar.core.workspace-files.settings.label': 'Workspace files',
        'core.settings.sidebar.core.settings.git.label': 'Source control',
        'core.settings.sidebar.core.settings.data.label': 'Storage operations',
        'core.settings.sidebar.core.settings.keys.label': 'Key map',
        'core.settings.sidebar.core.settings.gestures.label': 'Gestures',
        'core.settings.sidebar.core.settings.language.label': 'Language & Locale',
        'core.settings.sidebar.core.settings.language-packs.label': 'Language packs',
        'core.settings.sidebar.core.settings.session.label': 'Session state',
        'core.settings.sidebar.core.settings.visual.label': 'Visual matrix',
        'core.settings.sidebar.core.settings.workspace-preferences.label': 'Workspace preferences',
        'core.settings.keymap.save-buffer': 'Save buffer',
        'core.settings.keymap.command-palette': 'Command palette',
        'core.settings.keymap.new-file': 'New file',
        'core.settings.keymap.toggle-workspace-panel': 'Toggle workspace panel',
        'core.settings.keymap.focus-registry': 'Focus registry',
        'core.settings.keymap.next-tab': 'Next tab',
        'core.settings.keymap.prev-tab': 'Previous tab',
        'core.settings.keymap.view-editor': 'View editor',
        'core.settings.keymap.view-split': 'View split',
        'core.settings.keymap.view-preview': 'View preview',
        'core.settings.keymap.format-bold': 'Format bold',
        'core.settings.keymap.format-italic': 'Format italic',
        'core.settings.keymap.format-strikethrough': 'Format strikethrough',
        'core.settings.keymap.undo-op': 'Undo',
        'core.settings.keymap.redo-op': 'Redo',
        'core.settings.keymap.settings': 'Settings',
        'core.settings.keymap.toggle-git-mode': 'Toggle Git mode',
        'core.settings.keymap.zoom-in': 'Zoom in',
        'core.settings.keymap.zoom-out': 'Zoom out',
        'core.settings.keymap.reset-zoom': 'Reset zoom',
        'core.settings.keymap.print-preview': 'Print preview',
        'core.settings.gestures.file-tabs': 'File tabs',
        'core.settings.gestures.file-tabs.mapping': 'Swipe or drag horizontally',
        'core.settings.gestures.action-rail': 'Action rail',
        'core.settings.gestures.action-rail.mapping': 'Horizontal scroll',
        'core.settings.gestures.workspace-rail': 'Workspace rail',
        'core.settings.gestures.workspace-rail.mapping': 'Tap target pane',
        'core.settings.gestures.git-rail': 'Git rail',
        'core.settings.gestures.git-rail.mapping': 'Tap source or diff',
        'core.settings.gestures.keyboard': 'Visual keyboard',
        'core.settings.gestures.keyboard.mapping': 'Half-screen viewport',
        'core.settings.session.active-project': 'Active project',
        'core.settings.session.open-tabs': 'Open tabs',
        'core.settings.session.active-tab': 'Active tab',
        'core.settings.session.view-mode': 'View mode',
        'core.settings.session.app-mode': 'App mode',
        'core.settings.session.zoom-scale': 'Zoom scale',
        'core.settings.session.auto-save': 'Auto save',
        'core.settings.session.auto-save.description': 'Toggle instant persistence to local storage while editing.',
        'core.settings.session.restore-session': 'Restore session',
        'core.settings.session.restore-session.description': 'Persist current project, tabs, and layout so reloads resume from the last session.',
        'core.settings.session.line-numbers': 'Line numbers',
        'core.settings.session.line-numbers.description': 'Show or hide the editor gutter line numbers for the current workspace session.',
        'core.settings.workspace-preferences.section.title': 'Workspace Preferences',
        'core.settings.workspace-preferences.section.description': 'Rails, toolbar, and output options.',
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
        'core.commands.export-markdown': 'Export Markdown',
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
          runtime.getSnapshot().app.actions.addToast(t('core.settings.git.opened-configuration', 'Opened GitHub configuration'), 'info');
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
                      <span className={currentTheme === theme.id ? 'settings-accent-text' : 'settings-muted-text'}>{theme.icon}</span>
                      <span className="settings-theme-name">{theme.name}</span>
                    </div>
                    <span className="settings-theme-desc">{theme.description}</span>
                    <span className="settings-kicker">{t('core.settings.visual.code-syntax', 'Code syntax')} - {theme.syntaxTheme.name}</span>
                    <span className="settings-muted-caption">{theme.syntaxTheme.palette}</span>
                  </button>
                ))}
              </div>
              <div className="settings-theme-controls">
                <div className="settings-theme-meta">
                  <span className="settings-theme-label">{t('core.settings.visual.active-theme', 'Active theme')}</span>
                  <span className="settings-theme-value">{themeDef.name}</span>
                  <span className="settings-theme-count">{themeIndex + 1}/{THEMES.length}</span>
                </div>
                <div className="settings-theme-actions">
                  <button type="button" className="settings-theme-action-btn" onClick={() => handleThemeStep(-1)}>{t('core.settings.visual.prev-theme', 'Previous theme')}</button>
                  <button type="button" className="settings-theme-action-btn settings-theme-action-btn-primary" onClick={() => handleThemeStep(1)}>{t('core.settings.visual.next-theme', 'Next theme')}</button>
                </div>
              </div>
            </div>
          );
        },
      }),
      services.settingsRegistry.register({
        id: 'core.settings.markdown-profiles',
        title: label('Markdown Profiles', 'core.settings.markdown-profiles.title'),
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
            <div className="settings-card settings-card-list settings-keymap-grid settings-card-inset">
              {[
                { label: t('core.settings.keymap.save-buffer', 'Save buffer'), key: 'CTRL/CMD+S' },
                { label: t('core.settings.keymap.command-palette', 'Command palette'), key: 'CTRL/CMD+K' },
                { label: t('core.settings.keymap.new-file', 'New file'), key: 'CTRL/CMD+N' },
                { label: t('core.settings.keymap.toggle-workspace-panel', 'Toggle workspace panel'), key: 'CTRL/CMD+SHIFT+B' },
                { label: t('core.settings.keymap.focus-registry', 'Focus registry'), key: 'CTRL/CMD+SHIFT+E' },
                { label: t('core.settings.keymap.next-tab', 'Next tab'), key: 'CTRL/CMD+TAB' },
                { label: t('core.settings.keymap.prev-tab', 'Previous tab'), key: 'CTRL/CMD+SHIFT+TAB' },
                { label: t('core.settings.keymap.view-editor', 'View editor'), key: 'CTRL/CMD+1' },
                { label: t('core.settings.keymap.view-split', 'View split'), key: 'CTRL/CMD+2' },
                { label: t('core.settings.keymap.view-preview', 'View preview'), key: 'CTRL/CMD+3' },
                { label: t('core.settings.keymap.format-bold', 'Format bold'), key: 'CTRL/CMD+B' },
                { label: t('core.settings.keymap.format-italic', 'Format italic'), key: 'CTRL/CMD+I' },
                { label: t('core.settings.keymap.format-strikethrough', 'Format strikethrough'), key: 'CTRL/CMD+SHIFT+X' },
                { label: t('core.settings.keymap.undo-op', 'Undo'), key: 'CTRL/CMD+Z' },
                { label: t('core.settings.keymap.redo-op', 'Redo'), key: 'CTRL/CMD+SHIFT+Z' },
                { label: t('core.settings.keymap.settings', 'Settings'), key: 'CTRL/CMD+,' },
                { label: t('core.settings.keymap.toggle-git-mode', 'Toggle Git mode'), key: 'CTRL/CMD+SHIFT+G' },
                { label: t('core.settings.keymap.zoom-in', 'Zoom in'), key: 'CTRL/CMD++' },
                { label: t('core.settings.keymap.zoom-out', 'Zoom out'), key: 'CTRL/CMD+-' },
                { label: t('core.settings.keymap.reset-zoom', 'Reset zoom'), key: 'CTRL/CMD+0' },
                { label: t('core.settings.keymap.print-preview', 'Print preview'), key: 'CTRL/CMD+P' },
              ].map((row) => (
                <div key={row.label} className="settings-keymap-item">
                  <span className="settings-keymap-label settings-muted-text">{row.label}</span>
                  <span className="settings-keymap-key settings-accent-text font-mono">{row.key}</span>
                </div>
              ))}
            </div>
          </div>
        ),
      }),
      services.settingsRegistry.register({
        id: 'core.settings.gestures',
        title: label('Gesture Map', 'core.settings.sections.gestures.title'),
        description: label('Touch bindings for mobile navigation, rails, and keyboard-safe panes.', 'core.settings.sections.gestures.description'),
        order: 41,
        panel: 'keys',
        icon: { kind: 'lucide', name: 'Hand' },
        render: () => (
          <div className="settings-pane">
            <div className="settings-card settings-card-list settings-keymap-grid settings-card-inset">
              {[
                { label: t('core.settings.gestures.file-tabs', 'File tabs'), key: t('core.settings.gestures.file-tabs.mapping', 'Swipe or drag horizontally') },
                { label: t('core.settings.gestures.action-rail', 'Action rail'), key: t('core.settings.gestures.action-rail.mapping', 'Horizontal scroll') },
                { label: t('core.settings.gestures.workspace-rail', 'Workspace rail'), key: t('core.settings.gestures.workspace-rail.mapping', 'Tap target pane') },
                { label: t('core.settings.gestures.git-rail', 'Git rail'), key: t('core.settings.gestures.git-rail.mapping', 'Tap source or diff') },
                { label: t('core.settings.gestures.keyboard', 'Visual keyboard'), key: t('core.settings.gestures.keyboard.mapping', 'Half-screen viewport') },
              ].map((row) => (
                <div key={row.label} className="settings-keymap-item">
                  <span className="settings-keymap-label settings-muted-text">{row.label}</span>
                  <span className="settings-keymap-key settings-accent-text">{row.key}</span>
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
              <div className="settings-stack settings-stack--lg">
                <div className="settings-card settings-card-stack">
                  <div className="settings-session-grid">
                    <div className="settings-session-item"><span className="settings-session-label">{t('core.settings.session.active-project', 'Active project')}</span><span className="settings-session-value">{snapshot.app.state.currentProject?.name ?? t('core.settings.state.none', 'None')}</span></div>
                    <div className="settings-session-item"><span className="settings-session-label">{t('core.settings.session.open-tabs', 'Open tabs')}</span><span className="settings-session-value">{snapshot.app.state.tabs.length}</span></div>
                    <div className="settings-session-item"><span className="settings-session-label">{t('core.settings.session.active-tab', 'Active tab')}</span><span className="settings-session-value">{snapshot.activeTabName ?? t('core.settings.state.none', 'None')}</span></div>
                    <div className="settings-session-item"><span className="settings-session-label">{t('core.settings.session.view-mode', 'View mode')}</span><span className="settings-session-value">{snapshot.app.state.viewMode.toUpperCase()}</span></div>
                    <div className="settings-session-item"><span className="settings-session-label">{t('core.settings.session.app-mode', 'App mode')}</span><span className="settings-session-value">{snapshot.app.state.appMode.toUpperCase()}</span></div>
                    <div className="settings-session-item"><span className="settings-session-label">{t('core.settings.session.zoom-scale', 'Zoom scale')}</span><span className="settings-session-value">{snapshot.app.state.zoom.toFixed(2)}x</span></div>
                  </div>
                </div>
                <div className="settings-card settings-card-highlight settings-card-inset">
                  <div className="settings-row settings-row--top settings-row--bottom">
                    <div>
                      <span className="settings-section-label settings-inline-row settings-inline-row--sm">{t('core.settings.session.auto-save', 'Auto save')}</span>
                      <p className="settings-muted-caption settings-copy--spaced settings-copy--relaxed">{t('core.settings.session.auto-save.description', 'Toggle instant persistence to local storage while editing.')}</p>
                    </div>
                    <label className="pwa-toggle">
                      <input type="checkbox" checked={snapshot.app.state.autoSaveEnabled} onChange={(event) => snapshot.app.actions.setAutoSaveEnabled(event.target.checked)} />
                      <span className="pwa-toggle-indicator" />
                    </label>
                  </div>
                </div>
                <div className="settings-card settings-card-highlight settings-card-inset">
                  <div className="settings-row settings-row--top settings-row--bottom">
                    <div>
                      <span className="settings-section-label settings-inline-row settings-inline-row--sm">{t('core.settings.session.restore-session', 'Restore session')}</span>
                      <p className="settings-muted-caption settings-copy--spaced settings-copy--relaxed">{t('core.settings.session.restore-session.description', 'Persist current project, tabs, and layout so reloads resume from the last session.')}</p>
                    </div>
                    <label className="pwa-toggle">
                      <input type="checkbox" checked={snapshot.app.state.persistSessionEnabled} onChange={(event) => snapshot.app.actions.setPersistSessionEnabled(event.target.checked)} />
                      <span className="pwa-toggle-indicator" />
                    </label>
                  </div>
                </div>
                <div className="settings-card settings-card-highlight settings-card-inset">
                  <div className="settings-row settings-row--top settings-row--bottom">
                    <div>
                      <span className="settings-section-label settings-inline-row settings-inline-row--sm">{t('core.settings.session.line-numbers', 'Line numbers')}</span>
                      <p className="settings-muted-caption settings-copy--spaced settings-copy--relaxed">{t('core.settings.session.line-numbers.description', 'Show or hide the editor gutter line numbers for the current workspace session.')}</p>
                    </div>
                    <label className="pwa-toggle">
                      <input type="checkbox" checked={snapshot.app.state.showLineNumbers} onChange={(event) => snapshot.app.actions.setShowLineNumbers(event.target.checked)} />
                      <span className="pwa-toggle-indicator" />
                    </label>
                  </div>
                </div>
                <div className="settings-card settings-card-highlight settings-card-inset">
                  <div className="settings-row settings-row--top settings-row--bottom">
                    <div>
                      <span className="settings-section-label settings-inline-row settings-inline-row--sm">{t('core.settings.session.persistence-diagnostics', 'Persistence diagnostics')}</span>
                      <p className="settings-muted-caption settings-copy--spaced settings-copy--relaxed">{t('core.settings.session.persistence-diagnostics.description', 'Show storage backend details in the Data settings diagnostics panel.')}</p>
                    </div>
                    <label className="pwa-toggle">
                      <input type="checkbox" checked={snapshot.app.state.persistenceDiagnosticsEnabled} onChange={(event) => snapshot.app.actions.setPersistenceDiagnosticsEnabled(event.target.checked)} />
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

