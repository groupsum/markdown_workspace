import React from 'react';
import { useSyncExternalStore } from 'react';
import { Download, RefreshCw, ArrowUpCircle } from 'lucide-react';
import { Chassis } from '../../components/Chassis/Chassis';
import { Footer } from '../../components/Chassis/Footer/Footer';
import { GitPane } from '../../components/Chassis/Git/GitPane';
import { Header } from '../../components/Chassis/Header/Header';
import { WorkPane } from '../../components/Chassis/WorkPane/WorkPane';
import { InputModal } from '../../components/Modals/InputModal';
import { ProjectSelector } from '../../components/Project/ProjectSelector';
import { ToastContainer } from '../../components/UI/Toast';
import { APP_BUILD_ID, APP_VERSION, MARKDOWN_IMPORT_REQUEST_EVENT } from '../../constants';
import { useClientI18n } from '../features/i18n/useClientI18n';
import { ActionRailHost } from './ActionRailHost';
import { ViewLayerHost } from './ViewLayerHost';
import { useClientRuntimeServices, useClientRuntimeSnapshot } from '../app/runtime/ClientRuntimeContext';

export const AppShell: React.FC = () => {
  const runtime = useClientRuntimeSnapshot();
  const markdownImportRef = React.useRef<HTMLInputElement>(null);
  const services = useClientRuntimeServices();
  const viewSnapshot = useSyncExternalStore(services.views.subscribe, services.views.getSnapshot, services.views.getSnapshot);
  const { t } = useClientI18n();
  const { state, actions } = runtime.app;
  const { state: pwaState, actions: pwaActions } = runtime.pwa;
  const workspaceView =
    viewSnapshot.views.find((view) => view.id === viewSnapshot.activeMainViewId && view.id !== 'core.git-pane')
    ?? null;
  const workspaceViewRenderProps = workspaceView
    ? {
        viewId: workspaceView.id,
        input: viewSnapshot.inputs[workspaceView.id],
        isOpen: true,
        workspaceSidebarOpen: state.sidebarOpen,
        setWorkspaceSidebarOpen: actions.setSidebarOpen,
        close: () => services.views.close(workspaceView.id),
        focus: () => services.views.focus(workspaceView.id),
      }
    : null;

  const pwaAction = pwaState.canInstall
    ? {
        label: t('core.header.pwa.install.label', 'Install PWA'),
        title: t('core.header.pwa.install.title', 'Install MdWork'),
        icon: <Download size={16} />,
        onClick: pwaActions.promptInstall,
        disabled: false,
      }
    : pwaState.updateAvailable
      ? {
          label: t('core.header.pwa.update.label', 'Update PWA'),
          title: t('core.header.pwa.update.title', 'Apply the waiting build for this selected version'),
          icon: <RefreshCw size={16} />,
          onClick: pwaActions.requestUpdate,
          disabled: false,
        }
      : !pwaState.isLatest
        ? {
            label: t('core.header.pwa.latest.label', 'Switch To Latest'),
            title: t('core.header.pwa.latest.title', 'Navigate to the latest retained compatible version'),
            icon: <ArrowUpCircle size={16} />,
            onClick: pwaActions.switchToLatest,
            disabled: false,
          }
      : null;

  React.useEffect(() => {
    const handleImportRequest = () => markdownImportRef.current?.click();
    window.addEventListener(MARKDOWN_IMPORT_REQUEST_EVENT, handleImportRequest);
    return () => {
      window.removeEventListener(MARKDOWN_IMPORT_REQUEST_EVENT, handleImportRequest);
    };
  }, []);

  if (state.loading) {
    return <div className="boot-screen">{t('core.boot.sequence', 'BOOT SEQUENCE...')}</div>;
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
      showDesktopOpen={Boolean(window.desktopShell)}
      onOpenDesktopFile={actions.openMarkdownFromHost}
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
        pwaAction={pwaAction ?? undefined}
        onSwitchProject={actions.switchToProjectSelector}
        onTabSelect={(tabId, fileId) => {
          actions.setActiveTabId(tabId);
          actions.setAppMode('work');
          actions.setSelectedExplorerId(fileId);
        }}
        onTabClose={actions.closeTab}
        onZoom={actions.adjustZoom}
        onResetZoom={actions.resetZoom}
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
            showLineNumbers={state.showLineNumbers}
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
            workspaceSidebarSurface={
              workspaceView && workspaceViewRenderProps && workspaceView.renderSidebar
                ? workspaceView.renderSidebar(workspaceViewRenderProps) as React.ReactNode
                : undefined
            }
            workspaceSidebarLabel={
              workspaceView?.renderSidebar ? `${workspaceView.title.defaultMessage} Browser` : undefined
            }
            workspaceSurface={
              workspaceView && workspaceViewRenderProps
                ? workspaceView.render(workspaceViewRenderProps) as React.ReactNode
                : undefined
            }
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

      <input
        ref={markdownImportRef}
        type="file"
        accept=".md,.markdown,text/markdown,text/plain"
        multiple
        hidden
        onChange={(event) => {
          const files = event.target.files;
          if (files && files.length > 0) {
            void actions.handleImportMarkdown(files);
          }
          event.currentTarget.value = '';
        }}
      />

      <Footer
        className="status-bar"
        cursorLine={state.cursorPos.line}
        cursorCol={state.cursorPos.col}
        unsaved={state.unsaved}
        shellVersion={APP_VERSION}
        buildId={APP_BUILD_ID}
        online={runtime.online}
        isInstalled={pwaState.isInstalled}
        updateAvailable={pwaState.updateAvailable}
        latestAvailable={!pwaState.isLatest}
        autoSaveEnabled={state.autoSaveEnabled}
      />
    </div>
  );

  return (
    <Chassis zoom={state.zoom} mode={state.activeProjectId ? 'project' : 'selector'}>
      {pwaState.updateAvailable && (
        <div className="update-banner">
          <span>{t('core.update-banner.ready', 'UPDATE READY FOR SELECTED VERSION')}</span>
          <button onClick={pwaActions.requestUpdate} className="update-btn">
            <RefreshCw size={12} /> {t('core.update-banner.reload', 'RELOAD')}
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
