import React, { useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Chassis } from './components/Chassis/Chassis';
import { CommandPalette } from './components/Modals/CommandPalette';
import { InputModal } from './components/Modals/InputModal';
import { SettingsModal } from './components/Modals/SettingsModal';
import { ToastContainer } from './components/UI/Toast';
import { AppContent, buildPwaAction } from './app/AppContent';
import {
  buildCommandActions,
  inferPatProvider,
  normalizeRepositoryUrl,
  PROVIDER_REPO_HOST
} from './app/appConstants';
import { useAppLifecycle } from './app/useAppLifecycle';
import { useApp } from './hooks/useApp';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { usePwa } from './hooks/usePwa';
import type { OidcProviderId } from './types';

const App: React.FC = () => {
  const { state, actions } = useApp();
  const { state: pwaState, actions: pwaActions } = usePwa();
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  const [cloudSyncTick, setCloudSyncTick] = useState(0);
  const markdownImportRef = useRef<HTMLInputElement>(null);

  useKeyboardShortcuts(
    {
      showPalette: state.showPalette,
      showSettings: state.showSettings,
      showInputModal: state.showInputModal,
      hasActiveProject: Boolean(state.activeProjectId),
      appMode: state.appMode
    },
    {
      saveCurrentFile: actions.saveCurrentFile,
      promptNewFile: actions.promptNewFile,
      toggleSidebar: actions.toggleSidebar,
      setShowPalette: actions.setShowPalette,
      setShowSettings: actions.setShowSettings,
      setViewMode: actions.setViewMode,
      adjustZoom: actions.adjustZoom,
      setZoom: actions.setZoom,
      setAppMode: actions.setAppMode,
      setSidebarOpen: actions.setSidebarOpen,
      selectNextTab: actions.selectNextTab,
      selectPreviousTab: actions.selectPreviousTab,
      closeInputModal: actions.closeInputModal,
      printPreview: actions.handlePrint
    }
  );

  useAppLifecycle(actions, pwaState.updateAvailable, setUpdateAvailable, setOnline);

  if (state.loading) {
    return <div className="boot-screen">BOOT SEQUENCE...</div>;
  }

  const pwaAction = buildPwaAction(pwaState, pwaActions);
  const commandActions = buildCommandActions(actions, state.appMode);
  const activeTabName =
    state.files.find(
      (file) => file.id === state.tabs.find((tab) => tab.id === state.activeTabId)?.fileId
    )?.name ?? null;

  const handleTestLink = () => {
    const activeGitConfig = actions.getActiveGitConfig();
    const repoUrl = activeGitConfig.repoUrl.trim();

    if (!repoUrl) {
      actions.addToast('TEST LINK FAILED: REPOSITORY URL REQUIRED', 'warning');
      return;
    }

    const selectedProvider: OidcProviderId =
      activeGitConfig.authMode === 'pat'
        ? inferPatProvider(activeGitConfig.patToken) || activeGitConfig.oidcProvider || 'github'
        : activeGitConfig.oidcProvider || 'github';

    const candidateUrl = normalizeRepositoryUrl(repoUrl, PROVIDER_REPO_HOST[selectedProvider]);

    try {
      actions.addToast(`TEST LINK OK: ${new URL(candidateUrl).host}`, 'success');
    } catch {
      actions.addToast('TEST LINK FAILED: INVALID REPOSITORY URL', 'warning');
    }
  };

  return (
    <Chassis zoom={state.zoom} mode={state.activeProjectId ? 'project' : 'selector'}>
      {updateAvailable && (
        <div className="update-banner">
          <span>ARCHITECTURE UPDATE READY</span>
          <button
            className="update-btn"
            onClick={() => {
              actions.addToast('APPLYING UPDATE...', 'info');
              pwaActions.requestUpdate();
            }}
          >
            <RefreshCw size={12} /> RELOAD
          </button>
        </div>
      )}

      <SettingsModal
        isOpen={state.showSettings}
        onClose={() => actions.setShowSettings(false)}
        currentTheme={state.theme}
        onThemeChange={actions.setTheme}
        projectId={state.activeProjectId}
        gitConfig={actions.getActiveGitConfig()}
        onGitConfigChange={actions.handleGitConfigUpdate}
        onOidcSignIn={actions.handleOidcSignIn}
        onExport={actions.exportData}
        onRestore={actions.restoreData}
        pwaState={pwaState}
        onPwaInstall={pwaActions.promptInstall}
        onPwaUpdate={() => {
          actions.addToast('APPLYING UPDATE...', 'info');
          pwaActions.requestUpdate();
        }}
        onPwaAutoUpdateToggle={pwaActions.toggleAutoUpdate}
        sessionState={{
          currentProjectName: state.currentProject?.name ?? null,
          tabCount: state.tabs.length,
          activeTabName,
          zoom: state.zoom,
          viewMode: state.viewMode,
          appMode: state.appMode,
          autoSaveEnabled: state.autoSaveEnabled,
          persistSessionEnabled: state.persistSessionEnabled,
          showLineNumbers: state.showLineNumbers
        }}
        onAutoSaveToggle={actions.setAutoSaveEnabled}
        onPersistSessionToggle={actions.setPersistSessionEnabled}
        onLineNumbersToggle={actions.setShowLineNumbers}
        onTestLink={handleTestLink}
      />

      <InputModal
        isOpen={state.showInputModal}
        onClose={actions.closeInputModal}
        onSubmit={state.inputCallback}
        title={state.inputTitle}
        placeholder={state.inputPlaceholder}
        defaultValue={state.inputDefaultValue}
      />

      <CommandPalette
        isOpen={state.showPalette}
        onClose={() => actions.setShowPalette(false)}
        files={state.files}
        onSelectFile={actions.handleExplorerSelect}
        actions={commandActions}
      />

      <ToastContainer messages={state.toasts} onDismiss={actions.removeToast} />

      <AppContent
        state={state}
        actions={actions}
        pwaState={pwaState}
        pwaAction={pwaAction}
        online={online}
        cloudSyncTick={cloudSyncTick}
        setCloudSyncTick={setCloudSyncTick}
        markdownImportRef={markdownImportRef}
      />
    </Chassis>
  );
};

export default App;
