
import { useEffect, useCallback, useRef } from 'react';
import { beginOidcSignIn, completeOidcSignInFromCallback, getOidcPopupEventType } from '../services/oidc';
import { THEMES } from '../data/themes';
import { useToast } from './useToast';
import { useInputModal } from './useInputModal';
import { useUIState } from './useUIState';
import { useProjectManager } from './useProjectManager';
import { useFileManager } from './useFileManager';
import { useTabManager } from './useTabManager';
import { GIT_REPO_REFRESH_REQUEST_EVENT, MARKDOWN_IMPORT_REQUEST_EVENT } from '../constants';
import { buildNormalizedGitConfig, getAuthToken, getDefaultGitConfig } from '../services/gitConfig';
import { getGitAdapterService } from '../services/gitAdapter';
import type { GitConfig } from '../types';
import { readWorkspacePreferencesSync } from '../src/features/preferences/workspacePreferences';

const SESSION_STORAGE_KEY = 'mdwork-session-state';

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
  showLineNumbers: boolean;
  updatedAt: number;
};

type DesktopMarkdownFile = {
  path: string;
  name: string;
  content: string;
};

type DesktopWorkspaceSnapshot = {
  rootPath: string;
  name: string;
  entries: DesktopWorkspaceEntry[];
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
  const currentProject = proj.projects.find(p => p.id === proj.activeProjectId) ?? null;
  const fileSys = useFileManager(proj.activeProjectId, currentProject, ui.autoSaveEnabled, addToast);
  const tabs = useTabManager();

  const activeTab = tabs.tabs.find(t => t.id === tabs.activeTabId);
  const activeFile = activeTab ? fileSys.files.find(f => f.id === activeTab.fileId) || null : null;
  const currentThemeDef = THEMES.find(t => t.id === ui.theme) || THEMES[0];
  const oidcCallbackHandledRef = useRef(false);
  const projectLoadInFlightRef = useRef<string | null>(null);
  const pendingDesktopFilesRef = useRef<DesktopMarkdownFile[]>([]);

  const applyOidcResult = useCallback(async (result: Awaited<ReturnType<typeof completeOidcSignInFromCallback>>) => {
    if (result.status === 'success' && result.projectId && result.credential) {
      const targetProject = proj.projects.find((project) => project.id === result.projectId);
      if (targetProject) {
        const updatedProject = {
          ...targetProject,
          gitConfig: {
            ...targetProject.gitConfig,
            username: result.credential.username,
            oidcProvider: result.provider || targetProject.gitConfig.oidcProvider || 'github',
            oidcConnected: true,
            oidcSubject: result.credential.subject
          }
        };
        await proj.updateGitConfig(updatedProject.gitConfig);
        addToast(`OIDC SIGN-IN SUCCESS (${updatedProject.gitConfig.oidcProvider.toUpperCase()})`, 'success');
      }
    } else if (result.status === 'error') {
      addToast(result.message || 'OIDC SIGN-IN FAILED', 'warning');
    }

    if (result.status !== 'idle' && window.location.search) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [proj.projects, proj.updateGitConfig, addToast]);

  useEffect(() => {
    if (oidcCallbackHandledRef.current) {
      return;
    }
    oidcCallbackHandledRef.current = true;
    const completeOidc = async () => {
      const result = await completeOidcSignInFromCallback();
      await applyOidcResult(result);
    };

    void completeOidc();
  }, [applyOidcResult]);

  useEffect(() => {
    const eventType = getOidcPopupEventType();
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) {
        return;
      }
      if (!event.data || typeof event.data !== 'object') {
        return;
      }
      if ((event.data as { type?: string }).type !== eventType) {
        return;
      }
      const search = (event.data as { search?: string }).search;
      const hash = (event.data as { hash?: string }).hash;
      if ((typeof search !== 'string' || !search) && (typeof hash !== 'string' || !hash)) {
        return;
      }
      void completeOidcSignInFromCallback(typeof search === 'string' ? search : undefined, typeof hash === 'string' ? hash : undefined).then(applyOidcResult);
    };

    window.addEventListener('message', onMessage);
    return () => {
      window.removeEventListener('message', onMessage);
    };
  }, [applyOidcResult]);

  console.log("[useApp] Current State Summary:", {
    activeProjectId: proj.activeProjectId,
    activeFileId: activeFile?.id,
    activeTabId: tabs.activeTabId,
    appMode: ui.appMode,
    unsaved: fileSys.unsaved
  });

  const loadProject = useCallback(async (projectId: string) => {
    if (projectLoadInFlightRef.current === projectId) {
      return;
    }
    projectLoadInFlightRef.current = projectId;
    console.log(`[useApp] Action: loadProject -> ${projectId}`);
    try {
      proj.setLoading(true);
      proj.setActiveProjectId(projectId);
      const targetProject = proj.projects.find((project) => project.id === projectId) ?? null;
      if (targetProject?.sourceKind === 'filesystem' && targetProject.rootPath && window.desktopShell) {
        const snapshot = await window.desktopShell.readProjectDirectory({ rootPath: targetProject.rootPath });
        await fileSys.importFilesystemWorkspace(projectId, snapshot, {
          rootPath: snapshot.rootPath,
          sourceKind: 'filesystem',
        });
      }
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
          if (typeof storedSession.showLineNumbers === 'boolean') {
            ui.setShowLineNumbers(storedSession.showLineNumbers);
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
    } finally {
      if (projectLoadInFlightRef.current === projectId) {
        projectLoadInFlightRef.current = null;
      }
    }
  }, [
    proj.projects,
    proj.setActiveProjectId,
    fileSys.loadFiles,
    fileSys.importFilesystemWorkspace,
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
    ui.setAutoSaveEnabled,
    ui.setShowLineNumbers
  ]);

  const flushPendingDesktopFiles = useCallback(async () => {
    if (proj.loading || proj.projects.length === 0) {
      return;
    }

    const pendingFiles = pendingDesktopFilesRef.current;
    if (pendingFiles.length === 0) {
      return;
    }

    pendingDesktopFilesRef.current = [];

    const lastProjectId = localStorage.getItem('lastProjectId');
    const preferredProjectId = proj.activeProjectId
      ?? ((lastProjectId && proj.projects.find((project) => project.id === lastProjectId)?.id) ?? null)
      ?? proj.projects[0]?.id
      ?? null;

    if (!preferredProjectId) {
      pendingDesktopFilesRef.current = pendingFiles;
      return;
    }

    if (proj.activeProjectId !== preferredProjectId || fileSys.loadedProjectId !== preferredProjectId) {
      await loadProject(preferredProjectId);
    }

    const imported = await fileSys.importExternalMarkdownFiles(
      preferredProjectId,
      pendingFiles.map((file) => ({
        name: file.name,
        content: file.content,
        sourceKind: 'filesystem',
        sourcePath: file.path,
      })),
    );

    if (imported.length > 0) {
      await fileSys.loadFiles(preferredProjectId);
      const firstImportedFile = imported[0];
      tabs.openTab(firstImportedFile.id);
      fileSys.setSelectedExplorerId(firstImportedFile.id);
      ui.setAppMode('work');
    }
  }, [
    proj.loading,
    proj.projects,
    proj.activeProjectId,
    fileSys.loadedProjectId,
    fileSys.loadFiles,
    fileSys.importExternalMarkdownFiles,
    fileSys.setSelectedExplorerId,
    loadProject,
    tabs.openTab,
    ui.setAppMode,
  ]);

  const queueDesktopFiles = useCallback((incomingFiles: readonly DesktopMarkdownFile[]) => {
    if (incomingFiles.length === 0) {
      return;
    }
    pendingDesktopFilesRef.current = [...pendingDesktopFilesRef.current, ...incomingFiles];
    void flushPendingDesktopFiles();
  }, [flushPendingDesktopFiles]);

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
      showLineNumbers: ui.showLineNumbers,
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
    ui.autoSaveEnabled,
    ui.showLineNumbers
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
    void flushPendingDesktopFiles();
  }, [flushPendingDesktopFiles]);

  useEffect(() => {
    const clearPrintAttributes = () => {
      document.body.removeAttribute('data-print-background');
    };
    window.addEventListener('afterprint', clearPrintAttributes);
    return () => {
      window.removeEventListener('afterprint', clearPrintAttributes);
      clearPrintAttributes();
    };
  }, []);

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

  const createFilesystemProjectFromSnapshot = useCallback(async (snapshot: DesktopWorkspaceSnapshot) => {
    const newProj = await proj.createProject(snapshot.name, {
      sourceKind: 'filesystem',
      rootPath: snapshot.rootPath,
    });
    await fileSys.importFilesystemWorkspace(newProj.id, snapshot, {
      rootPath: snapshot.rootPath,
      sourceKind: 'filesystem',
    });
    await loadProject(newProj.id);
  }, [fileSys, loadProject, proj]);

  const mountFilesystemSnapshotToProject = useCallback(async (snapshot: DesktopWorkspaceSnapshot, projectId: string) => {
    const targetProject = proj.projects.find((project) => project.id === projectId);
    if (!targetProject) {
      await createFilesystemProjectFromSnapshot(snapshot);
      return;
    }

    const mountedProject = {
      ...targetProject,
      sourceKind: 'filesystem' as const,
      rootPath: snapshot.rootPath,
      lastOpened: Date.now(),
    };

    await proj.updateProject(mountedProject);
    await fileSys.importFilesystemWorkspace(projectId, snapshot, {
      rootPath: snapshot.rootPath,
      sourceKind: 'filesystem',
    });
    await loadProject(projectId);
    addToast(`MOUNTED ${snapshot.name.toUpperCase()} TO ${mountedProject.name.toUpperCase()}`, 'success');
  }, [addToast, createFilesystemProjectFromSnapshot, fileSys, loadProject, proj]);

  const openDesktopProjectFolder = useCallback(async () => {
    if (!window.desktopShell) {
      addToast('DESKTOP SHELL REQUIRED', 'warning');
      return;
    }

    try {
      const snapshot = await window.desktopShell.openProjectDirectory();
      if (!snapshot) {
        return;
      }
      if (proj.activeProjectId) {
        await mountFilesystemSnapshotToProject(snapshot, proj.activeProjectId);
        return;
      }
      await createFilesystemProjectFromSnapshot(snapshot);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'OPEN FOLDER FAILED';
      addToast(message.toUpperCase(), 'warning');
    }
  }, [addToast, createFilesystemProjectFromSnapshot, mountFilesystemSnapshotToProject, proj.activeProjectId]);

  const createDesktopProject = useCallback(async (name: string) => {
    if (!window.desktopShell) {
      handleCreateProject(name);
      return;
    }

    try {
      const desktopPath = await window.desktopShell.getDesktopPath();
      const snapshot = await window.desktopShell.createProjectDirectory({
        name,
        parentPath: desktopPath,
      });
      await createFilesystemProjectFromSnapshot(snapshot);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'DESKTOP PROJECT CREATE FAILED';
      addToast(message.toUpperCase(), 'warning');
    }
  }, [addToast, createFilesystemProjectFromSnapshot]);

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

  async function saveCurrentFile(): Promise<void> {
      console.log(`[useApp] Action: saveCurrentFile initiated -> ${activeFile?.id}`);
      if (activeFile) {
          await fileSys.saveFile(activeFile);
      }
  }

  useEffect(() => {
    if (!window.desktopShell) {
      return;
    }

    let isMounted = true;

    window.desktopShell.getLaunchMarkdownFiles()
      .then((files) => {
        if (isMounted) {
          queueDesktopFiles(files);
        }
      })
      .catch((error) => {
        console.warn('[useApp] Failed to read launch markdown files', error);
      });

    const unsubscribeOpen = window.desktopShell.onOpenMarkdownFiles((files) => {
      queueDesktopFiles(files);
    });
    const unsubscribeMount = window.desktopShell.onMountProjectDirectory((snapshot) => {
      if (proj.activeProjectId) {
        void mountFilesystemSnapshotToProject(snapshot, proj.activeProjectId);
        return;
      }
      void createFilesystemProjectFromSnapshot(snapshot);
    });
    const unsubscribeSave = window.desktopShell.onSaveActiveMarkdownRequested(() => {
      void saveCurrentFile();
    });

    return () => {
      isMounted = false;
      unsubscribeOpen();
      unsubscribeMount();
      unsubscribeSave();
    };
  }, [createFilesystemProjectFromSnapshot, mountFilesystemSnapshotToProject, proj.activeProjectId, queueDesktopFiles]);

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

  const restoreData = async (payload: string) => {
      console.log('[useApp] Action: restoreData initiated');
      const restoredFiles = await fileSys.restoreProjectData(payload);
      if (!restoredFiles) return;
      tabs.resetTabs();
      const target = restoredFiles.find((file) => file.name.toLowerCase() === 'readme.md' || file.name.toLowerCase() === 'welcome.md')
        || restoredFiles.find((file) => file.type === 'file');
      if (target) {
        tabs.openTab(target.id);
        fileSys.setSelectedExplorerId(target.id);
      }
  };

  const handleImportMarkdown = async (inputFiles: FileList | File[]) => {
      const imported = await fileSys.importMarkdownFiles(inputFiles);
      if (imported.length > 0) {
        const firstImportedFile = imported[0];
        tabs.openTab(firstImportedFile.id);
        fileSys.setSelectedExplorerId(firstImportedFile.id);
        ui.setAppMode('work');
      }
  };

  const openMarkdownFromHost = async () => {
      if (!window.desktopShell) {
        if (!proj.activeProjectId) {
          addToast('SELECT A PROJECT BEFORE IMPORT', 'warning');
          return;
        }
        window.dispatchEvent(new CustomEvent(MARKDOWN_IMPORT_REQUEST_EVENT));
        return;
      }

      try {
        const files = await window.desktopShell.openMarkdownFiles();
        queueDesktopFiles(files);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'MARKDOWN OPEN FAILED';
        addToast(message.toUpperCase(), 'warning');
      }
  };

  const handleHtmlExport = () => {
      console.log(`[useApp] Action: handleHtmlExport initiated`);
      fileSys.exportHtmlNode(ui.theme);
  };

  const handlePrint = () => {
      console.log(`[useApp] Action: handlePrint initiated`);
      if (!activeFile) return;
      const workspacePreferences = readWorkspacePreferencesSync();
      ui.setAppMode('work');
      ui.setViewMode('preview');
      ui.setSidebarOpen(false);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => window.print());
      });
      document.body.setAttribute('data-print-background', workspacePreferences.printBackground);
  };

  const handleGitConfigUpdate = async (config: GitConfig) => {
      await proj.updateGitConfig(config);
  };

  const handleGitConfigSave = async (config: GitConfig) => {
      if (!proj.activeProjectId) {
        addToast('NO ACTIVE PROJECT', 'warning');
        return null;
      }
      const normalized = buildNormalizedGitConfig(config);
      await proj.updateGitConfig(normalized);
      window.dispatchEvent(new CustomEvent(GIT_REPO_REFRESH_REQUEST_EVENT));
      addToast('GIT CONFIG SAVED', 'success');
      return normalized;
  };

  const refreshGitRepositories = () => {
      window.dispatchEvent(new CustomEvent(GIT_REPO_REFRESH_REQUEST_EVENT));
      addToast('REPOSITORY REFRESH REQUESTED', 'info');
  };

  const testGitLink = async (config: GitConfig) => {
      if (!proj.activeProjectId) {
        addToast('NO ACTIVE PROJECT', 'warning');
        return false;
      }
      try {
        const normalized = buildNormalizedGitConfig(config);
        await proj.updateGitConfig(normalized);
        const provider = normalized.oidcProvider || 'github';
        const adapter = getGitAdapterService(provider);
        const token = await getAuthToken(proj.activeProjectId, normalized);
        const repos = await adapter.listRepos(token);
        if (normalized.repoUrl.trim()) {
          const candidate = normalized.repoUrl.trim().toLowerCase();
          const repoMatch = repos.some((repo) => repo.htmlUrl.toLowerCase() === candidate || repo.fullName.toLowerCase() === candidate.replace(`https://${adapter.repoHost}/`, ''));
          if (!repoMatch) {
            addToast('AUTH OK, REPO NOT FOUND IN ACCESSIBLE SET', 'warning');
            window.dispatchEvent(new CustomEvent(GIT_REPO_REFRESH_REQUEST_EVENT));
            return false;
          }
        }
        addToast(`LINK VERIFIED (${provider.toUpperCase()})`, 'success');
        window.dispatchEvent(new CustomEvent(GIT_REPO_REFRESH_REQUEST_EVENT));
        return true;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'LINK TEST FAILED';
        addToast(message.toUpperCase(), 'warning');
        return false;
      }
  };

  const switchToProjectSelector = () => {
      console.log(`[useApp] Action: switchToProjectSelector`);
      proj.setActiveProjectId(null);
      localStorage.removeItem('lastProjectId');
  };

  const handleOidcSignIn = async () => {
      if (!proj.activeProjectId) {
        addToast('SELECT A PROJECT BEFORE OIDC SIGN-IN', 'warning');
        return;
      }
      const activeGitConfig = currentProject?.gitConfig;
      if (!activeGitConfig) {
        addToast('PROJECT CONFIG NOT AVAILABLE', 'warning');
        return;
      }
      if (activeGitConfig.authMode !== 'oidc') {
        addToast('OIDC SIGN-IN IS DISABLED WHEN AUTH MODE IS PAT', 'warning');
        return;
      }
      try {
        addToast('OIDC REDIRECT IN PROGRESS', 'info');
        await beginOidcSignIn({
          projectId: proj.activeProjectId,
          provider: activeGitConfig.oidcProvider || 'github',
          username: activeGitConfig.username || 'user'
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'OIDC SIGN-IN FAILED';
        addToast(message.toUpperCase(), 'warning');
      }
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
      showLineNumbers: ui.showLineNumbers,
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
      createDesktopProject,
      openDesktopProjectFolder,
      handleDeleteProject: proj.deleteProject,
      handleGitConfigUpdate,
      handleOidcSignIn,
      getActiveGitConfig: () => currentProject?.gitConfig || getDefaultGitConfig(),
      handleGitConfigSave,
      testGitLink,
      refreshGitRepositories,
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
      restoreData,
      handleImportMarkdown,
      openMarkdownFromHost,
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
      setShowLineNumbers: ui.setShowLineNumbers,
      addToast,
      removeToast,
      requestMarkdownImport: () => {
          if (window.desktopShell) {
              void openMarkdownFromHost();
              return;
          }
          if (!proj.activeProjectId) {
              addToast('SELECT A PROJECT BEFORE IMPORT', 'warning');
              return;
          }
          window.dispatchEvent(new CustomEvent(MARKDOWN_IMPORT_REQUEST_EVENT));
      },
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
