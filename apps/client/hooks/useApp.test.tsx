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
    projects: [{ id: 'proj-1', name: 'Project 1', gitConfig: {}, createdAt: 0, lastOpened: 0 }],
    activeProjectId: 'proj-1',
    loading: false,
    setLoading: setLoadingMock,
    setActiveProjectId: setActiveProjectIdMock,
    createProject: vi.fn(),
    deleteProject: vi.fn(),
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
    loadedProjectId: null,
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
    exportHtmlNode: vi.fn()
  })
}));

vi.mock('./useTabManager', () => ({
  useTabManager: () => ({
    tabs: [],
    activeTabId: null,
    setActiveTabId: vi.fn(),
    openTab: vi.fn(),
    closeTab: vi.fn(),
    resetTabs: vi.fn(),
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
  });

  it('prevents duplicate loadProject calls when effects re-run in StrictMode', async () => {
    render(
      <React.StrictMode>
        <Harness />
      </React.StrictMode>
    );

    await waitFor(() => {
      expect(loadFilesMock).toHaveBeenCalledTimes(1);
    });
  });
});
