import React from 'react';
import { CheckCircle, Download, RefreshCw } from 'lucide-react';
import { Chassis } from '../../components/Chassis/Chassis';
import { Footer } from '../../components/Chassis/Footer/Footer';
import { GitPane } from '../../components/Chassis/Git/GitPane';
import { Header } from '../../components/Chassis/Header/Header';
import { WorkPane } from '../../components/Chassis/WorkPane/WorkPane';
import { InputModal } from '../../components/Modals/InputModal';
import { ProjectSelector } from '../../components/Project/ProjectSelector';
import { ToastContainer } from '../../components/UI/Toast';
import { APP_VERSION } from '../../constants';
import { ActionRailHost } from './ActionRailHost';
import { ViewLayerHost } from './ViewLayerHost';
import { useClientRuntimeServices, useClientRuntimeSnapshot } from '../app/runtime/ClientRuntimeContext';

export const AppShell: React.FC = () => {
  const runtime = useClientRuntimeSnapshot();
  const services = useClientRuntimeServices();
  const { state, actions } = runtime.app;
  const { state: pwaState, actions: pwaActions } = runtime.pwa;

  const pwaAction = pwaState.canInstall
    ? {
        label: 'Install PWA',
        title: 'Install Lattice Architect',
        icon: <Download size={16} />,
        onClick: pwaActions.promptInstall,
        disabled: false,
      }
    : pwaState.updateAvailable
      ? {
          label: 'Update PWA',
          title: 'Update available',
          icon: <RefreshCw size={16} />,
          onClick: pwaActions.requestUpdate,
          disabled: false,
        }
      : {
          label: 'PWA Installed',
          title: 'PWA installed',
          icon: <CheckCircle size={16} />,
          onClick: undefined,
          disabled: true,
        };

  if (state.loading) {
    return <div className="boot-screen">BOOT SEQUENCE...</div>;
  }

  const content = !state.activeProjectId ? (
    <ProjectSelector
      projects={state.projects}
      activeProjectId={state.activeProjectId}
      onSelectProject={(project) => actions.loadProject(project.id)}
      onCreateProject={actions.handleCreateProject}
      onDeleteProject={actions.handleDeleteProject}
      currentTheme={state.theme}
      onThemeChange={actions.setTheme}
    />
  ) : (
    <div className="app-root">
      <Header
        className="app-header"
        currentThemeDef={state.currentThemeDef}
        projectTitle={state.currentProject?.name || 'PROJECT'}
        tabs={state.tabs}
        files={state.files}
        activeTabId={state.activeTabId}
        appMode={state.appMode}
        zoom={state.zoom}
        pwaAction={pwaAction}
        onSwitchProject={actions.switchToProjectSelector}
        onTabSelect={(tabId, fileId) => {
          actions.setActiveTabId(tabId);
          actions.setAppMode('work');
          actions.setSelectedExplorerId(fileId);
        }}
        onTabClose={actions.closeTab}
        onZoom={actions.adjustZoom}
        onOpenSettings={() => { void services.views.open('core.settings'); }}
      />

      <section className={`app-grid mode-${state.appMode}`}>
        <ActionRailHost className="action-rail" />
        {state.appMode === 'work' ? (
          <WorkPane
            currentProject={state.currentProject}
            files={state.files}
            activeFile={state.activeFile}
            selectedExplorerId={state.selectedExplorerId}
            searchQuery={state.searchQuery}
            theme={state.theme}
            viewMode={state.viewMode}
            currentThemeDef={state.currentThemeDef}
            sidebarOpen={state.sidebarOpen}
            sidebarWidth={state.sidebarWidth}
            onSidebarToggle={actions.setSidebarOpen}
            onSidebarWidthChange={actions.setSidebarWidth}
            onNewFile={actions.promptNewFile}
            onNewFolder={actions.promptNewFolder}
            onRenameSelected={actions.promptRenameSelected}
            onDeleteSelected={actions.deleteSelectedItem}
            onFileSelect={actions.handleExplorerSelect}
            onFileHighlight={actions.highlightExplorerNode}
            onFileMove={actions.handleMoveFile}
            onContentChange={actions.handleContentChange}
            onCursorChange={(line, col) => actions.setCursorPos({ line, col })}
            onViewModeChange={actions.setViewMode}
          />
        ) : (
          <GitPane
            files={state.files}
            activeFile={state.activeFile}
            theme={state.theme}
            unsaved={state.unsaved}
            onClose={() => { void services.views.close('core.git-pane'); }}
          />
        )}
      </section>

      <Footer
        className="status-bar"
        cursorLine={state.cursorPos.line}
        cursorCol={state.cursorPos.col}
        unsaved={state.unsaved}
        version={APP_VERSION}
        online={runtime.online}
      />
    </div>
  );

  return (
    <Chassis zoom={state.zoom} mode={state.activeProjectId ? 'project' : 'selector'}>
      {runtime.updateAvailable && (
        <div className="update-banner">
          <span>ARCHITECTURE UPDATE READY</span>
          <button onClick={pwaActions.requestUpdate} className="update-btn">
            <RefreshCw size={12} /> RELOAD
          </button>
        </div>
      )}

      <ViewLayerHost />

      <InputModal
        isOpen={state.showInputModal}
        onClose={actions.closeInputModal}
        onSubmit={state.inputCallback}
        title={state.inputTitle}
        placeholder={state.inputPlaceholder}
        defaultValue={state.inputDefaultValue}
      />

      <ToastContainer messages={state.toasts} onDismiss={actions.removeToast} />
      {content}
    </Chassis>
  );
};
