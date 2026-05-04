// @vitest-environment jsdom
import React from 'react';
import { render, waitFor, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useApp } from './useApp';

const loadFilesMock = vi.fn(async () => []);
const setLoadingMock = vi.fn();
const setActiveProjectIdMock = vi.fn();
const setSelectedExplorerIdMock = vi.fn();
const updateLastOpenedMock = vi.fn();
const createProjectMock = vi.fn();
const importExternalMarkdownFilesMock = vi.fn(async () => []);
const openTabMock = vi.fn();
const resetTabsMock = vi.fn();
let mockProjects = [{ id: 'proj-1', name: 'Desktop Imports', gitConfig: {}, createdAt: 0, lastOpened: 0 }];
let mockActiveProjectId: string | null = 'proj-1';
let mockLoading = false;
let mockLoadedProjectId: string | null = 'proj-1';

vi.mock('./useToast', () => ({
  useToast: () => ({
    toasts: [],
    addToast: vi.fn(),
    removeToast: vi.fn()
  })
}));

vi.mock('./useInputModal', () => ({
  useInputModal: () => ({
    showInputModal: false,
    inputCallback: undefined,
    inputTitle: '',
    inputPlaceholder: '',
    inputDefaultValue: '',
    promptInput: vi.fn(),
    closeInputModal: vi.fn()
  })
}));

vi.mock('./useUIState', () => ({
  useUIState: () => ({
    showSettings: false,
    setShowSettings: vi.fn(),
    showPalette: false,
    setShowPalette: vi.fn(),
    theme: 'micropress',
    setTheme: vi.fn(),
    zoom: 1,
    setZoom: vi.fn(),
    adjustZoom: vi.fn(),
    appMode: 'work',
    setAppMode: vi.fn(),
    sidebarOpen: true,
    setSidebarOpen: vi.fn(),
    sidebarWidth: 280,
    setSidebarWidth: vi.fn(),
    searchQuery: '',
    setSearchQuery: vi.fn(),
    viewMode: 'split',
    setViewMode: vi.fn(),
    cursorPos: { line: 1, col: 1 },
    setCursorPos: vi.fn(),
    autoSaveEnabled: true,
    setAutoSaveEnabled: vi.fn(),
    persistSessionEnabled: true,
    setPersistSessionEnabled: vi.fn(),
    showLineNumbers: true,
    setShowLineNumbers: vi.fn()
  })
}));

vi.mock('./useProjectManager', () => ({
  useProjectManager: () => ({
    projects: mockProjects,
    activeProjectId: mockActiveProjectId,
    loading: mockLoading,
    setLoading: setLoadingMock,
    setActiveProjectId: setActiveProjectIdMock,
    createProject: createProjectMock,
    deleteProject: vi.fn(),
    updateProject: vi.fn(),
    updateGitConfig: vi.fn(),
    updateLastOpened: updateLastOpenedMock
  })
}));

vi.mock('./useFileManager', () => ({
  useFileManager: () => ({
    files: [],
    setFiles: vi.fn(),
    selectedExplorerId: null,
    setSelectedExplorerId: setSelectedExplorerIdMock,
    unsaved: false,
    setUnsaved: vi.fn(),
    loadedProjectId: mockLoadedProjectId,
    loadFiles: loadFilesMock,
    createNewFile: vi.fn(),
    createNewFolder: vi.fn(),
    renameNode: vi.fn(),
    deleteNode: vi.fn(async () => []),
    saveFile: vi.fn(),
    updateFileContent: vi.fn(),
    moveFile: vi.fn(),
    downloadNode: vi.fn(),
    exportProjectData: vi.fn(),
    restoreProjectData: vi.fn(),
    importMarkdownFiles: vi.fn(async () => []),
    importExternalMarkdownFiles: importExternalMarkdownFilesMock,
    importFilesystemWorkspace: vi.fn(),
    exportMarkdownNode: vi.fn(),
    exportHtmlNode: vi.fn()
  })
}));

vi.mock('./useTabManager', () => ({
  useTabManager: () => ({
    tabs: [],
    activeTabId: null,
    setActiveTabId: vi.fn(),
    openTab: openTabMock,
    closeTab: vi.fn(),
    resetTabs: resetTabsMock,
    setTabs: vi.fn()
  })
}));

const Harness: React.FC = () => {
  useApp();
  return null;
};

describe('useApp project loading', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    window.localStorage.clear();
    delete window.desktopShell;
    mockProjects = [{ id: 'proj-1', name: 'Desktop Imports', gitConfig: {}, createdAt: 0, lastOpened: 0 }];
    mockActiveProjectId = 'proj-1';
    mockLoading = false;
    mockLoadedProjectId = 'proj-1';
  });

  it('prevents duplicate loadProject calls when effects re-run in StrictMode', async () => {
    mockLoadedProjectId = null;

    render(
      <React.StrictMode>
        <Harness />
      </React.StrictMode>
    );

    await waitFor(() => {
      expect(loadFilesMock).toHaveBeenCalledTimes(1);
    });
  });

  it('opens desktop-imported markdown in place without resetting the loaded import project', async () => {
    importExternalMarkdownFilesMock.mockResolvedValueOnce([
      {
        id: 'file-imported-1',
        projectId: 'proj-1',
        name: 'opened.md',
        type: 'file',
        content: '# opened',
        lastModified: 1,
      },
    ]);

    window.desktopShell = {
      isDesktop: true,
      openMarkdownFiles: vi.fn(async () => []),
      saveMarkdownFile: vi.fn(async () => ({ path: 'C:\\opened.md' })),
      getDesktopPath: vi.fn(async () => 'C:\\Users\\bigman\\Desktop'),
      openProjectDirectory: vi.fn(async () => null),
      readProjectDirectory: vi.fn(async () => ({ rootPath: 'C:\\workspace', name: 'workspace', entries: [] })),
      createProjectDirectory: vi.fn(async () => ({ rootPath: 'C:\\workspace', name: 'workspace', entries: [] })),
      createDirectory: vi.fn(async () => ({ path: 'C:\\workspace' })),
      renamePath: vi.fn(async () => ({ path: 'C:\\workspace\\renamed.md' })),
      deletePath: vi.fn(async () => ({ path: 'C:\\workspace\\deleted.md' })),
      movePath: vi.fn(async () => ({ path: 'C:\\workspace\\moved.md' })),
      getLaunchMarkdownFiles: vi.fn(async () => [
        { path: 'C:\\opened.md', name: 'opened.md', content: '# opened' },
      ]),
      onOpenMarkdownFiles: vi.fn(() => () => {}),
      onMountProjectDirectory: vi.fn(() => () => {}),
      onSaveActiveMarkdownRequested: vi.fn(() => () => {}),
    };

    render(<Harness />);

    await waitFor(() => {
      expect(importExternalMarkdownFilesMock).toHaveBeenCalledWith('proj-1', [
        {
          name: 'opened.md',
          content: '# opened',
          sourceKind: 'filesystem',
          sourcePath: 'C:\\opened.md',
        },
      ]);
    });

    await waitFor(() => {
      expect(openTabMock).toHaveBeenCalledWith('file-imported-1');
    });

    expect(resetTabsMock).not.toHaveBeenCalled();
    expect(setActiveProjectIdMock).not.toHaveBeenCalledWith('proj-1');
    expect(setSelectedExplorerIdMock).toHaveBeenCalledWith('file-imported-1');
  });
});
