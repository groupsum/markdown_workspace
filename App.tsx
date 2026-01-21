import React, { useState, useEffect } from 'react';
import { Chassis } from './components/Chassis/Chassis';
import { GitPane } from './components/Chassis/Git/GitPane';
import { CommandPalette } from './components/Modals/CommandPalette';
import { ProjectSelector } from './components/Project/ProjectSelector';
import { SettingsModal } from './components/Modals/SettingsModal';
import { ToastContainer } from './components/UI/Toast';
import { InputModal } from './components/Modals/InputModal';
import { Footer } from './components/Chassis/Footer/Footer';
import { Folder, FilePlus, GitBranch, LayoutGrid, Download, Cloud, FileDown, FolderPlus, Printer } from 'lucide-react';
import { Header } from './components/Chassis/Header/Header';
import { ActionRail } from './components/Chassis/ActionRail/ActionRail';
import { WorkPane } from './components/Chassis/WorkPane/WorkPane';
import { useApp } from './hooks/useApp';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { APP_VERSION } from './constants';

const App: React.FC = () => {
  const { state, actions } = useApp();
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);

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

  useEffect(() => {
    const handleUpdate = () => setUpdateAvailable(true);
    const handleOnline = () => { setOnline(true); actions.addToast('SYSTEM ONLINE', 'success'); };
    const handleOffline = () => { setOnline(false); actions.addToast('SYSTEM OFFLINE', 'warning'); };

    window.addEventListener('lattice-update-ready', handleUpdate);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('lattice-update-ready', handleUpdate);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [actions]);

  const commandActions = [
    { id: 'new-file', label: 'Create New File', action: actions.promptNewFile, icon: <FilePlus size={14}/> },
    { id: 'new-folder', label: 'Create New Folder', action: actions.promptNewFolder, icon: <FolderPlus size={14}/> },
    { id: 'save', label: 'Save Current File', action: actions.saveCurrentFile, icon: <Settings size={14}/> },
    { id: 'toggle-sidebar', label: 'Toggle Explorer', action: actions.toggleSidebar, icon: <Folder size={14}/> },
    { id: 'download', label: 'Download Current Item', action: actions.handleDownload, icon: <Download size={14}/> },
    { id: 'export-html', label: 'Export HTML', action: actions.handleHtmlExport, icon: <FileDown size={14}/> },
    { id: 'print-preview', label: 'Print Preview', action: actions.handlePrint, icon: <Printer size={14}/> },
    { id: 'git-mode', label: 'Toggle Git Operations', action: () => actions.setAppMode(state.appMode === 'git' ? 'work' : 'git'), icon: <GitBranch size={14}/> },
    { id: 'switch-project', label: 'Switch Project', action: actions.switchToProjectSelector, icon: <LayoutGrid size={14}/> },
    { id: 'settings', label: 'System Settings', action: () => actions.setShowSettings(true), icon: <Settings size={14}/> },
    { id: 'zoom-in', label: 'Zoom In', action: () => actions.adjustZoom(0.1), icon: <Plus size={14}/> },
    { id: 'zoom-out', label: 'Zoom Out', action: () => actions.adjustZoom(-0.1), icon: <Minus size={14}/> },
    { id: 'view-editor', label: 'Editor View', action: () => actions.setViewMode('editor'), icon: <LayoutGrid size={14}/> },
    { id: 'view-split', label: 'Split View', action: () => actions.setViewMode('split'), icon: <LayoutGrid size={14}/> },
    { id: 'view-preview', label: 'Preview View', action: () => actions.setViewMode('preview'), icon: <LayoutGrid size={14}/> },
    { id: 'next-tab', label: 'Next Tab', action: actions.selectNextTab, icon: <LayoutGrid size={14}/> },
    { id: 'previous-tab', label: 'Previous Tab', action: actions.selectPreviousTab, icon: <LayoutGrid size={14}/> }
  ];

  if (state.loading) return <div className="boot-screen">BOOT SEQUENCE...</div>;

  const content = !state.activeProjectId ? (
    <ProjectSelector 
      projects={state.projects}
      activeProjectId={state.activeProjectId}
      onSelectProject={(p) => actions.loadProject(p.id)}
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
        tabs={state.tabs}
        files={state.files}
        activeTabId={state.activeTabId}
        appMode={state.appMode}
        zoom={state.zoom}
        onSwitchProject={actions.switchToProjectSelector}
        onTabSelect={(tabId, fileId) => { actions.setActiveTabId(tabId); actions.setAppMode('work'); actions.setSelectedExplorerId(fileId); }}
        onTabClose={actions.closeTab}
        onZoom={actions.adjustZoom}
        onNewFile={actions.promptNewFile}
        onNewFolder={actions.promptNewFolder}
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
          onPrint={actions.handlePrint}
          onCloudSync={() => actions.addToast('SYNC: CLOUD UNREACHABLE', 'warning')}
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
            onSidebarToggle={actions.setSidebarOpen}
            onNewFile={actions.promptNewFile}
            onNewFolder={actions.promptNewFolder}
            onFileSelect={actions.handleExplorerSelect}
            onFileHighlight={actions.highlightExplorerNode}
            onFileMove={actions.handleMoveFile}
            onContentChange={actions.handleContentChange}
            onCursorChange={(l, c) => actions.setCursorPos({ line: l, col: c })}
            onViewModeChange={actions.setViewMode}
          />
        ) : (
          <GitPane 
            files={state.files} 
            activeFile={state.activeFile} 
            theme={state.theme}
            unsaved={state.unsaved} 
            onClose={() => actions.setAppMode('work')} 
          />
        )}
      </section>

      <Footer 
        className="status-bar"
        cursorLine={state.cursorPos.line}
        cursorCol={state.cursorPos.col}
        unsaved={state.unsaved}
        version={APP_VERSION}
        online={online}
      />
    </div>
  );

  return (
    <Chassis zoom={state.zoom} mode={state.activeProjectId ? "project" : "selector"}>
      {updateAvailable && (
        <div className="update-banner">
          <span>ARCHITECTURE UPDATE READY</span>
          <button onClick={() => window.location.reload()} className="update-btn">
            <RefreshCw size={12} /> RELOAD
          </button>
        </div>
      )}
      
      <SettingsModal 
        isOpen={state.showSettings} 
        onClose={() => actions.setShowSettings(false)}
        currentTheme={state.theme}
        onThemeChange={actions.setTheme}
        gitConfig={actions.getActiveGitConfig()}
        onGitConfigChange={actions.handleGitConfigUpdate}
        onExport={actions.exportData}
      />

      <InputModal
        isOpen={state.showInputModal}
        onClose={actions.closeInputModal}
        onSubmit={state.inputCallback}
        title={state.inputTitle}
        placeholder={state.inputPlaceholder}
      />

      <CommandPalette 
        isOpen={state.showPalette}
        onClose={() => actions.setShowPalette(false)}
        files={state.files}
        onSelectFile={actions.handleExplorerSelect}
        actions={commandActions}
      />

      <ToastContainer messages={state.toasts} onDismiss={actions.removeToast} />
      {content}
    </Chassis>
  );
};

export default App;
