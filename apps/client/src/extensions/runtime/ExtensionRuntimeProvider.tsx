import React from 'react';
import { createExtensionRuntime } from '@mdwrk/extension-runtime';
import { createWorkspaceFilesBundledEntry } from '@mdwrk/extension-workspace-files';
import { createGitOpsBundledEntry } from '@mdwrk/extension-git-ops';
import { createLanguagePackStudioBundledEntry } from '@mdwrk/extension-language-pack-studio';
import { createExtensionManagerBundledEntry } from '@mdwrk/extension-manager';
import { createGeminiAgentBundledEntry } from '@mdwrk/extension-gemini-agent';
import { createThemeStudioBundledEntry } from '@mdwrk/extension-theme-studio';
import { useClientExtensionHost, useClientRuntimeServices, useClientRuntimeSnapshot } from '../../app/runtime/ClientRuntimeContext';
import { createLanguagePackStudioController } from '../../features/i18n/languagePackStudioController';
import { loadWorkspaceLanguageTokenCatalog } from '../../features/i18n/languageTokenCatalog';
import { GitOperationsExplorer, GitPane } from '../../../components/Chassis/Git/GitPane';
import { GitSettingsPanel } from '../../features/settings/GitSettingsPanel';
import { WorkspacePreferencesPanel } from '../../features/preferences/WorkspacePreferencesPanel';
import { ExtensionRuntimeDiagnosticsPanel } from './ExtensionRuntimeDiagnosticsPanel';
import { ExtensionRuntimeContextProvider } from './ExtensionRuntimeContext';
import { createClientExtensionRegistrationSink } from './createClientExtensionRegistrationSink';
import { runtimeSmokeExtensionEntry } from './bundled';

export interface ExtensionRuntimeProviderProps extends React.PropsWithChildren {}

export const ExtensionRuntimeProvider: React.FC<ExtensionRuntimeProviderProps> = ({ children }) => {
  const services = useClientRuntimeServices();
  const snapshot = useClientRuntimeSnapshot();
  const snapshotRef = React.useRef(snapshot);
  snapshotRef.current = snapshot;
  const host = useClientExtensionHost();

  const registrationSink = React.useMemo(() => createClientExtensionRegistrationSink(services), [services]);
  const languagePackController = React.useMemo(() => createLanguagePackStudioController({
    i18n: services.i18n,
    settingsStore: services.settingsStore,
    loadTokenCatalog: loadWorkspaceLanguageTokenCatalog,
  }), [services.i18n, services.settingsStore]);
  const runtime = React.useMemo(() => createExtensionRuntime({
    host,
    registrationSink,
    storage: services.settingsStore,
    trustPolicy: {
      allowUnsigned: true,
      allowIntegrityOnly: true,
    },
  }), [host, registrationSink, services.settingsStore]);

  const bundledEntries = React.useMemo(() => [
    createWorkspaceFilesBundledEntry({
      actions: {
        toggleExplorer: async () => {
          snapshotRef.current.app.actions.toggleSidebar();
        },
        newFile: () => snapshotRef.current.app.actions.promptNewFile(),
        newFolder: () => snapshotRef.current.app.actions.promptNewFolder(),
        saveCurrentFile: () => snapshotRef.current.app.actions.saveCurrentFile(),
        renameSelected: () => snapshotRef.current.app.actions.promptRenameSelected(),
        deleteSelected: () => snapshotRef.current.app.actions.deleteSelectedItem(),
        importMarkdown: () => snapshotRef.current.app.actions.requestMarkdownImport(),
        openHostFile: () => snapshotRef.current.app.actions.openMarkdownFromHost(),
        downloadWorkspace: () => snapshotRef.current.app.actions.handleDownload(),
        exportHtml: () => snapshotRef.current.app.actions.handleHtmlExport(),
        printPreview: () => snapshotRef.current.app.actions.handlePrint(),
        viewEditor: () => snapshotRef.current.app.actions.setViewMode('editor'),
        viewSplit: () => snapshotRef.current.app.actions.setViewMode('split'),
        viewPreview: () => snapshotRef.current.app.actions.setViewMode('preview'),
        focusExplorer: () => {
          snapshotRef.current.app.actions.setSidebarOpen(true);
          requestAnimationFrame(() => {
            document.querySelector<HTMLElement>('.file-tree-container')?.focus();
          });
        },
      },
      isExplorerActive: () => !services.views.getSnapshot().activeMainViewId && snapshotRef.current.app.state.sidebarOpen,
      renderWorkspace: () => (
        <div className="settings-pane">
          <div className="settings-card settings-card-stack">
            <span className="font-bold text-[11px] uppercase">WORKSPACE_FILES</span>
            <p className="text-[11px] text-[var(--fg-muted)] leading-relaxed">
              File browsing, editing, and previewing are mounted as the default workspace module surface.
            </p>
          </div>
        </div>
      ),
      renderExplorer: () => (
        <div className="workspace-panel-content">
          <div className="settings-card settings-card-stack">
            <span className="settings-session-label">FILE_EXPLORER</span>
            <span className="settings-session-value">{snapshotRef.current.app.state.currentProject?.name ?? 'NO_PROJECT'}</span>
          </div>
        </div>
      ),
      renderSettings: () => <WorkspacePreferencesPanel />,
    }),
    createGitOpsBundledEntry({
      toggleGitOps: async () => { await services.views.toggle('core.git-pane'); },
      refreshGitOps: () => snapshotRef.current.app.actions.refreshGitRepositories(),
      isActive: () => services.views.getSnapshot().openViewIds.includes('core.git-pane'),
      renderWorkspace: (props) => (
        <GitPane
          files={snapshotRef.current.app.state.files}
          activeFile={snapshotRef.current.app.state.activeFile}
          theme={snapshotRef.current.app.state.theme}
          unsaved={snapshotRef.current.app.state.unsaved}
          onClose={() => { void props.close(); }}
          shellSidebarOpen={props.workspaceSidebarOpen}
          onShellSidebarToggle={props.setWorkspaceSidebarOpen}
        />
      ),
      renderExplorer: () => (
        <GitOperationsExplorer
          activeFile={snapshotRef.current.app.state.activeFile}
          unsaved={snapshotRef.current.app.state.unsaved}
        />
      ),
      renderSettings: () => <GitSettingsPanel />,
    }),
    createExtensionManagerBundledEntry({ runtime }),
    createLanguagePackStudioBundledEntry({ controller: languagePackController }),
    createGeminiAgentBundledEntry(),
    createThemeStudioBundledEntry(),
    runtimeSmokeExtensionEntry,
  ], [languagePackController, runtime, services.views]);

  React.useEffect(() => {
    const disposables = bundledEntries.map((entry) => runtime.registerBundledExtension(entry));
    void runtime.start();
    return () => {
      void runtime.stop();
      for (const disposable of disposables) {
        disposable.dispose();
      }
    };
  }, [bundledEntries, runtime]);

  React.useEffect(() => {
    const disposable = services.settingsRegistry.register({
      id: 'core.settings.extensions.runtime',
      title: { defaultMessage: 'Extension Runtime' },
      description: { defaultMessage: 'Bundled extension catalog, activation state, and runtime diagnostics.' },
      order: 10,
      panel: 'extensions',
      icon: { kind: 'lucide', name: 'Plug' },
      render: () => <ExtensionRuntimeDiagnosticsPanel />,
    });
    return () => disposable.dispose();
  }, [services.settingsRegistry]);

  return (
    <ExtensionRuntimeContextProvider runtime={runtime}>
      {children}
    </ExtensionRuntimeContextProvider>
  );
};
