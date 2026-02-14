
import { useEffect, useCallback } from 'react';
import { THEMES } from '../data/themes';
import { useToast } from './useToast';
import { useInputModal } from './useInputModal';
import { useUIState } from './useUIState';
import { useProjectManager } from './useProjectManager';
import { useFileManager } from './useFileManager';
import { useTabManager } from './useTabManager';

const SESSION_STORAGE_KEY = 'lattice-session-state';

type SessionState = {
  projectId: string;
  tabFileIds: string[];
  activeTabFileId: string | null;
  selectedExplorerId: string | null;
  theme: string;
  zoom: number;
  viewMode: string;
  appMode: string;
  sidebarOpen: boolean;
  sidebarWidth: number;
  searchQuery: string;
  autoSaveEnabled: boolean;
  updatedAt: number;
};

const readSessionState = (): SessionState | null => {
  const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionState;
  } catch (error) {
    console.warn('[useApp] Failed to parse stored session state', error);
    return null;
  }
};

/**
 * Main application orchestrator.
 */
export const useApp = () => {
  console.log("[useApp] Hook initialization/re-render");

  const { toasts, addToast, removeToast } = useToast();
  const { 
    showInputModal, inputCallback, inputTitle, inputPlaceholder, inputDefaultValue,
    promptInput, closeInputModal 
  } = useInputModal();

  const ui = useUIState();
  const proj = useProjectManager(addToast);
  const fileSys = useFileManager(proj.activeProjectId, ui.autoSaveEnabled, addToast);
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

    const storedSession = ui.persistSessionEnabled ? readSessionState() : null;
    let restoredSession = false;
    if (storedSession && storedSession.projectId === projectId) {
      const validIds = new Set(projectFiles.map(file => file.id));
      const tabFileIds = storedSession.tabFileIds.filter(id => validIds.has(id));
      if (tabFileIds.length > 0) {
        tabs.setTabs(tabFileIds.map((id) => ({ id: `tab-${id}`, fileId: id })));
        const activeFileId = storedSession.activeTabFileId && validIds.has(storedSession.activeTabFileId)
          ? storedSession.activeTabFileId
          : tabFileIds[0];
        tabs.setActiveTabId(activeFileId ? `tab-${activeFileId}` : null);
        const selection = storedSession.selectedExplorerId && validIds.has(storedSession.selectedExplorerId)
          ? storedSession.selectedExplorerId
          : activeFileId ?? null;
        fileSys.setSelectedExplorerId(selection);
        ui.setAppMode(storedSession.appMode === 'git' ? 'git' : 'work');
        ui.setViewMode(storedSession.viewMode === 'editor' || storedSession.viewMode === 'preview' ? storedSession.viewMode : 'split');
        ui.setSidebarOpen(Boolean(storedSession.sidebarOpen));
        if (typeof storedSession.sidebarWidth === 'number') {
          ui.setSidebarWidth(storedSession.sidebarWidth);
        }
        if (typeof storedSession.zoom === 'number') {
          ui.setZoom(storedSession.zoom);
        }
        if (typeof storedSession.searchQuery === 'string') {
          ui.setSearchQuery(storedSession.searchQuery);
        }
        if (typeof storedSession.autoSaveEnabled === 'boolean') {
          ui.setAutoSaveEnabled(storedSession.autoSaveEnabled);
        }
        restoredSession = true;
      }
    }

    const readme = projectFiles.find(f => f.name.toLowerCase() === 'readme.md' || f.name.toLowerCase() === 'welcome.md');
    const first = projectFiles.find(f => f.type === 'file');
    const target = readme || first;

    if (target && !restoredSession) {
       console.log(`[useApp] Auto-opening initial file: ${target.name}`);
       tabs.openTab(target.id);
       fileSys.setSelectedExplorerId(target.id);
    }

    proj.updateLastOpened(projectId);
    localStorage.setItem('lastProjectId', projectId);
    proj.setLoading(false);
  }, [
    proj.setActiveProjectId,
    fileSys.loadFiles,
    fileSys.setSelectedExplorerId,
    tabs.resetTabs,
    tabs.setTabs,
    tabs.setActiveTabId,
    tabs.openTab,
    ui.persistSessionEnabled,
    ui.setAppMode,
    ui.setViewMode,
    ui.setSidebarOpen,
    ui.setSidebarWidth,
    ui.setZoom,
    ui.setSearchQuery,
    ui.setAutoSaveEnabled
  ]);

  useEffect(() => {
    if (!ui.persistSessionEnabled) {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
      return;
    }
    if (!proj.activeProjectId) return;
    const activeTabFileId = tabs.tabs.find(tab => tab.id === tabs.activeTabId)?.fileId ?? null;
    const sessionState: SessionState = {
      projectId: proj.activeProjectId,
      tabFileIds: tabs.tabs.map(tab => tab.fileId),
      activeTabFileId,
      selectedExplorerId: fileSys.selectedExplorerId,
      theme: ui.theme,
      zoom: ui.zoom,
      viewMode: ui.viewMode,
      appMode: ui.appMode,
      sidebarOpen: ui.sidebarOpen,
      sidebarWidth: ui.sidebarWidth,
      searchQuery: ui.searchQuery,
      autoSaveEnabled: ui.autoSaveEnabled,
      updatedAt: Date.now()
    };
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionState));
  }, [
    ui.persistSessionEnabled,
    proj.activeProjectId,
    tabs.tabs,
    tabs.activeTabId,
    fileSys.selectedExplorerId,
    ui.theme,
    ui.zoom,
    ui.viewMode,
    ui.appMode,
    ui.sidebarOpen,
    ui.sidebarWidth,
    ui.searchQuery,
    ui.autoSaveEnabled
  ]);

  useEffect(() => {
    if (!proj.loading && proj.projects.length > 0 && !proj.activeProjectId) {
        const lastId = localStorage.getItem('lastProjectId');
        console.log(`[useApp] Effect: Attempting auto-restore project -> ${lastId}`);
        if (lastId && proj.projects.find(p => p.id === lastId)) {
            loadProject(lastId);
        }
    }
  }, [proj.loading, proj.projects, proj.activeProjectId, loadProject]);

  useEffect(() => {
    if (proj.loading) return;
    if (!proj.activeProjectId) return;
    if (fileSys.loadedProjectId === proj.activeProjectId) return;
    console.log(`[useApp] Effect: Loading persisted project -> ${proj.activeProjectId}`);
    loadProject(proj.activeProjectId);
  }, [proj.loading, proj.activeProjectId, fileSys.loadedProjectId, loadProject]);

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
              ui.setAppMode('work');
              fileSys.setSelectedExplorerId(newFile.id);
              tabs.openTab(newFile.id);
          }
      });
  };

  const promptNewFolder = () => {
      console.log(`[useApp] Action: promptNewFolder initiated`);
      if (!proj.activeProjectId) return;
      promptInput('Create New Folder', 'folder-name', async (name) => {
          console.log(`[useApp] Action: promptNewFolder callback executing -> ${name}`);
          const newFolder = await fileSys.createNewFolder(name);
          if (newFolder) {
              fileSys.setSelectedExplorerId(newFolder.id);
          }
      });
  };

  const promptRenameSelected = () => {
      const selectedId = fileSys.selectedExplorerId;
      if (!selectedId) {
          addToast('SELECT FILE OR FOLDER TO RENAME', 'warning');
          return;
      }
      const node = fileSys.files.find(f => f.id === selectedId);
      if (!node) return;
      const placeholder = node.type === 'file' ? 'filename.md' : 'folder-name';
      const title = node.type === 'file' ? 'Rename File' : 'Rename Folder';
      promptInput(title, placeholder, async (name) => {
          await fileSys.renameNode(node.id, name);
      }, node.name);
  };

  const deleteSelectedItem = async () => {
      const selectedId = fileSys.selectedExplorerId;
      if (!selectedId) {
          addToast('SELECT FILE OR FOLDER TO DELETE', 'warning');
          return;
      }
      const node = fileSys.files.find(f => f.id === selectedId);
      if (!node) return;
      const promptMessage = node.type === 'folder'
        ? `DELETE FOLDER "${node.name}" AND ITS CONTENTS?`
        : `DELETE FILE "${node.name}"?`;
      if (!window.confirm(promptMessage)) return;
      const deletedFileIds = await fileSys.deleteNode(selectedId);
      if (deletedFileIds.length > 0) {
          const tabsToClose = tabs.tabs.filter(tab => deletedFileIds.includes(tab.fileId));
          tabsToClose.forEach(tab => tabs.closeTab(tab.id));
      }
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

  const handlePrint = () => {
      console.log(`[useApp] Action: handlePrint initiated`);
      if (!activeFile) return;
      ui.setAppMode('work');
      ui.setViewMode('preview');
      ui.setSidebarOpen(false);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => window.print());
      });
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
      sidebarWidth: ui.sidebarWidth,
      searchQuery: ui.searchQuery,
      autoSaveEnabled: ui.autoSaveEnabled,
      persistSessionEnabled: ui.persistSessionEnabled,
      toasts,
      viewMode: ui.viewMode,
      cursorPos: ui.cursorPos,
      showInputModal,
      inputCallback,
      inputTitle,
      inputPlaceholder,
      inputDefaultValue,
      activeFile,
      currentProject,
      currentThemeDef
    },
    actions: {
      loadProject,
      handleCreateProject,
      handleDeleteProject: proj.deleteProject,
      handleGitConfigUpdate: proj.updateGitConfig,
      getActiveGitConfig: () => currentProject?.gitConfig || { repoUrl: '', branch: '', username: '', oidcProvider: 'github', oidcConnected: false, oidcSubject: '' },
      handleExplorerSelect,
      handleContentChange: (c: string) => {
          console.log(`[useApp] Action: handleContentChange for file -> ${activeFile?.id}`);
          activeFile && fileSys.updateFileContent(activeFile.id, c);
      },
      saveCurrentFile,
      promptNewFile,
      promptNewFolder,
      promptRenameSelected,
      deleteSelectedItem,
      handleDownload,
      handleMoveFile: fileSys.moveFile,
      exportData,
      handleHtmlExport,
      handlePrint,
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
      setSidebarWidth: ui.setSidebarWidth,
      setSearchQuery: ui.setSearchQuery,
      setViewMode: ui.setViewMode,
      setCursorPos: ui.setCursorPos,
      setAutoSaveEnabled: ui.setAutoSaveEnabled,
      setPersistSessionEnabled: ui.setPersistSessionEnabled,
      addToast,
      removeToast,
      toggleSidebar: () => {
          ui.setSidebarOpen(!ui.sidebarOpen);
          ui.setAppMode('work');
      },
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
