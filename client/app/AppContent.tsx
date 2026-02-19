import React from 'react';
import { CheckCircle, Download, RefreshCw } from 'lucide-react';
import { Header } from '../components/Chassis/Header/Header';
import { ActionRail } from '../components/Chassis/ActionRail/ActionRail';
import { WorkPane } from '../components/Chassis/WorkPane/WorkPane';
import { GitPane } from '../components/Chassis/Git/GitPane';
import { Footer } from '../components/Chassis/Footer/Footer';
import { ProjectSelector } from '../components/Project/ProjectSelector';
import { APP_VERSION } from '../constants';

export const buildPwaAction = (pwaState: any, pwaActions: any) => {
  if (pwaState.canInstall) {
    return {
      label: 'Install PWA',
      title: 'Install Lattice Architect',
      icon: <Download size={16} />,
      onClick: pwaActions.promptInstall,
      disabled: false
    };
  }

  if (pwaState.updateAvailable) {
    return {
      label: 'Update PWA',
      title: 'Update available',
      icon: <RefreshCw size={16} />,
      onClick: pwaActions.requestUpdate,
      disabled: false
    };
  }

  return {
    label: 'PWA Installed',
    title: 'PWA installed',
    icon: <CheckCircle size={16} />,
    onClick: undefined,
    disabled: true
  };
};

interface AppContentProps {
  state: any;
  actions: any;
  pwaState: any;
  pwaAction: any;
  online: boolean;
  cloudSyncTick: number;
  setCloudSyncTick: React.Dispatch<React.SetStateAction<number>>;
  markdownImportRef: React.RefObject<HTMLInputElement | null>;
}

export const AppContent: React.FC<AppContentProps> = (props) => {
  const {
    state,
    actions,
    pwaState,
    pwaAction,
    online,
    cloudSyncTick,
    setCloudSyncTick,
    markdownImportRef
  } = props;

  if (!state.activeProjectId) {
    return (
      <ProjectSelector
        projects={state.projects}
        activeProjectId={state.activeProjectId}
        onSelectProject={(project) => actions.loadProject(project.id)}
        onCreateProject={actions.handleCreateProject}
        onDeleteProject={actions.handleDeleteProject}
        currentTheme={state.theme}
        onThemeChange={actions.setTheme}
      />
    );
  }

  return (
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
        onOpenSettings={() => actions.setShowSettings(true)}
      />

      <section className={`app-grid mode-${state.appMode}`}>
        <ActionRail
          className="action-rail"
          sidebarOpen={state.sidebarOpen}
          appMode={state.appMode}
          onToggleSidebar={actions.toggleSidebar}
          onNewFile={actions.promptNewFile}
          onNewFolder={actions.promptNewFolder}
          onToggleGit={() => actions.setAppMode(state.appMode === 'git' ? 'work' : 'git')}
          onSwitchProject={actions.switchToProjectSelector}
          onDownload={actions.handleDownload}
          onExportHtml={actions.handleHtmlExport}
          onImportMarkdown={() => markdownImportRef.current?.click()}
          onPrint={actions.handlePrint}
          onCloudSync={() => {
            setCloudSyncTick((prev) => prev + 1);
            window.dispatchEvent(new CustomEvent('lattice:gh:refresh-repos'));
            actions.addToast('GITHUB CLOUD SYNC REQUESTED', 'info');
          }}
        />

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
            showLineNumbers={state.showLineNumbers}
          />
        ) : (
          <GitPane
            files={state.files}
            activeFile={state.activeFile}
            theme={state.theme}
            unsaved={state.unsaved}
            projectId={state.activeProjectId}
            gitConfig={actions.getActiveGitConfig()}
            cloudSyncTick={cloudSyncTick}
            onStatus={actions.addToast}
          />
        )}
      </section>

      <input
        ref={markdownImportRef}
        type="file"
        accept=".md,text/markdown"
        multiple
        hidden
        onChange={(event) => {
          const files = event.target.files;
          if (files && files.length > 0) {
            void actions.handleImportMarkdown(files);
          }
          event.target.value = '';
        }}
      />

      <Footer
        className="status-bar"
        cursorLine={state.cursorPos.line}
        cursorCol={state.cursorPos.col}
        unsaved={state.unsaved}
        version={APP_VERSION}
        online={online}
        isInstalled={pwaState.isInstalled}
        updateAvailable={pwaState.updateAvailable}
      />
    </div>
  );
};
