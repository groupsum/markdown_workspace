
import { useEffect, useCallback } from 'react';
import { THEMES } from '../data/themes';
import { useToast } from './useToast';
import { useInputModal } from './useInputModal';
import { useUIState } from './useUIState';
import { useProjectManager } from './useProjectManager';
import { useFileManager } from './useFileManager';
import { useTabManager } from './useTabManager';

/**
 * Main application orchestrator.
 */
export const useApp = () => {
  console.log("[useApp] Hook initialization/re-render");

  const { toasts, addToast, removeToast } = useToast();
  const { 
    showInputModal, inputCallback, inputTitle, inputPlaceholder, 
    promptInput, closeInputModal 
  } = useInputModal();

  const ui = useUIState();
  const proj = useProjectManager(addToast);
  const fileSys = useFileManager(proj.activeProjectId, addToast);
  const tabs = useTabManager();

  const activeTab = tabs.tabs.find(t => t.id === tabs.activeTabId);
  const activeFile = activeTab ? fileSys.files.find(f => f.id === activeTab.fileId) || null : null;
  const currentProject = proj.projects.find(p => p.id === proj.activeProjectId);
  const currentThemeDef = THEMES.find(t => t.id === ui.theme) || THEMES[0];

  console.log("[useApp] Current State Summary:", {
    activeProjectId: proj.activeProjectId,
    activeFileId: activeFile?.id,
    activeTabId: tabs.activeTabId,
    appMode: ui.appMode,
    unsaved: fileSys.unsaved
  });

  const loadProject = useCallback(async (projectId: string) => {
    console.log(`[useApp] Action: loadProject -> ${projectId}`);
    proj.setLoading(true);
    proj.setActiveProjectId(projectId);
    const projectFiles = await fileSys.loadFiles(projectId);
    tabs.resetTabs();
    fileSys.setSelectedExplorerId(null);

    const readme = projectFiles.find(f => f.name.toLowerCase() === 'readme.md' || f.name.toLowerCase() === 'welcome.md');
    const first = projectFiles.find(f => f.type === 'file');
    const target = readme || first;

    if (target) {
       console.log(`[useApp] Auto-opening initial file: ${target.name}`);
       tabs.openTab(target.id);
       fileSys.setSelectedExplorerId(target.id);
    }

    proj.updateLastOpened(projectId);
    localStorage.setItem('lastProjectId', projectId);
    proj.setLoading(false);
  }, [proj.setActiveProjectId, fileSys.loadFiles, tabs.resetTabs, tabs.openTab]);

  useEffect(() => {
    if (!proj.loading && proj.projects.length > 0 && !proj.activeProjectId) {
        const lastId = localStorage.getItem('lastProjectId');
        console.log(`[useApp] Effect: Attempting auto-restore project -> ${lastId}`);
        if (lastId && proj.projects.find(p => p.id === lastId)) {
            loadProject(lastId);
        }
    }
  }, [proj.loading, proj.projects, proj.activeProjectId, loadProject]);

  const handleCreateProject = async (name: string) => {
      console.log(`[useApp] Action: handleCreateProject -> ${name}`);
      const newProj = await proj.createProject(name);
      loadProject(newProj.id);
  };

  const handleExplorerSelect = (fileId: string) => {
      console.log(`[useApp] Action: handleExplorerSelect -> ${fileId}`);
      ui.setAppMode('work');
      fileSys.setSelectedExplorerId(fileId);
      const node = fileSys.files.find(f => f.id === fileId);
      if (node && node.type === 'file') {
          tabs.openTab(fileId);
      }
  };

  const promptNewFile = () => {
      console.log(`[useApp] Action: promptNewFile initiated`);
      if (!proj.activeProjectId) return;
      promptInput('Create New File', 'filename.md', async (name) => {
          console.log(`[useApp] Action: promptNewFile callback executing -> ${name}`);
          const newFile = await fileSys.createNewFile(name);
          if (newFile) {
              handleExplorerSelect(newFile.id);
          }
      });
  };

  const saveCurrentFile = async () => {
      console.log(`[useApp] Action: saveCurrentFile initiated -> ${activeFile?.id}`);
      if (activeFile) {
          await fileSys.saveFile(activeFile);
      }
  };

  const selectTabByOffset = (offset: number) => {
    if (tabs.tabs.length === 0) return;
    const currentIndex = Math.max(tabs.tabs.findIndex(t => t.id === tabs.activeTabId), 0);
    const nextIndex = (currentIndex + offset + tabs.tabs.length) % tabs.tabs.length;
    const nextTab = tabs.tabs[nextIndex];
    if (!nextTab) return;
    tabs.setActiveTabId(nextTab.id);
    ui.setAppMode('work');
    fileSys.setSelectedExplorerId(nextTab.fileId);
  };

  const handleDownload = () => {
      console.log(`[useApp] Action: handleDownload initiated`);
      fileSys.downloadNode();
  };

  const exportData = () => {
      console.log(`[useApp] Action: exportData initiated`);
      currentProject && fileSys.exportProjectData(currentProject.name);
  };

  const handleHtmlExport = () => {
      console.log(`[useApp] Action: handleHtmlExport initiated`);
      fileSys.exportHtmlNode(ui.theme);
  };

  const switchToProjectSelector = () => {
      console.log(`[useApp] Action: switchToProjectSelector`);
      proj.setActiveProjectId(null);
      localStorage.removeItem('lastProjectId');
  };

  return {
    state: {
      projects: proj.projects,
      activeProjectId: proj.activeProjectId,
      files: fileSys.files,
      tabs: tabs.tabs,
      activeTabId: tabs.activeTabId,
      selectedExplorerId: fileSys.selectedExplorerId,
      unsaved: fileSys.unsaved,
      loading: proj.loading,
      showSettings: ui.showSettings,
      showPalette: ui.showPalette,
      theme: ui.theme,
      zoom: ui.zoom,
      appMode: ui.appMode,
      sidebarOpen: ui.sidebarOpen,
      searchQuery: ui.searchQuery,
      toasts,
      viewMode: ui.viewMode,
      cursorPos: ui.cursorPos,
      showInputModal,
      inputCallback,
      inputTitle,
      inputPlaceholder,
      activeFile,
      currentProject,
      currentThemeDef
    },
    actions: {
      loadProject,
      handleCreateProject,
      handleDeleteProject: proj.deleteProject,
      handleGitConfigUpdate: proj.updateGitConfig,
      getActiveGitConfig: () => currentProject?.gitConfig || { repoUrl: '', branch: '', username: '', pat: '' },
      handleExplorerSelect,
      handleContentChange: (c: string) => {
          console.log(`[useApp] Action: handleContentChange for file -> ${activeFile?.id}`);
          activeFile && fileSys.updateFileContent(activeFile.id, c);
      },
      saveCurrentFile,
      promptNewFile,
      handleDownload,
      handleMoveFile: fileSys.moveFile,
      exportData,
      handleHtmlExport,
      setFiles: fileSys.setFiles,
      setTabs: tabs.setTabs,
      setActiveTabId: tabs.setActiveTabId,
      setSelectedExplorerId: fileSys.setSelectedExplorerId,
      setUnsaved: fileSys.setUnsaved,
      setLoading: proj.setLoading,
      setShowSettings: ui.setShowSettings,
      setShowPalette: ui.setShowPalette,
      setTheme: ui.setTheme,
      setZoom: ui.setZoom,
      setAppMode: ui.setAppMode,
      setSidebarOpen: ui.setSidebarOpen,
      setSearchQuery: ui.setSearchQuery,
      setViewMode: ui.setViewMode,
      setCursorPos: ui.setCursorPos,
      addToast,
      removeToast,
      toggleSidebar: () => ui.setSidebarOpen(!ui.sidebarOpen),
      adjustZoom: ui.adjustZoom,
      selectNextTab: () => selectTabByOffset(1),
      selectPreviousTab: () => selectTabByOffset(-1),
      resetZoom: () => ui.setZoom(1),
      switchToProjectSelector,
      closeTab: (e: any, id: string) => { 
          console.log(`[useApp] Action: closeTab -> ${id}`);
          e.stopPropagation(); tabs.closeTab(id); 
      },
      closeInputModal,
      highlightExplorerNode: fileSys.setSelectedExplorerId
    }
  };
};
