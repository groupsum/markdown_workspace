
import { useState, useEffect } from 'react';
import { AppTheme, AppMode, ViewMode } from '../types';
import * as themeService from '../services/themeService';
import { storage } from '../services/storage';

const UI_STATE_KEY = 'lattice-ui-state';

type StoredUiState = {
  zoom: number;
  appMode: AppMode;
  sidebarOpen: boolean;
  sidebarWidth: number;
  searchQuery: string;
  viewMode: ViewMode;
  autoSaveEnabled: boolean;
  persistSessionEnabled: boolean;
  showLineNumbers: boolean;
  persistenceDiagnosticsEnabled: boolean;
};

const DEFAULT_SIDEBAR_WIDTH = 280;

const getStoredUiState = (): Partial<StoredUiState> => {
  const raw = window.localStorage.getItem(UI_STATE_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as StoredUiState;
  } catch (error) {
    console.warn('[useUIState] Failed to parse stored UI state', error);
    return {};
  }
};

export const useUIState = () => {
  const storedUi = getStoredUiState();
  const [showSettings, setShowSettings] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  
  const [theme, setThemeState] = useState<AppTheme>(() => themeService.getStoredTheme());
  const [zoom, setZoom] = useState(storedUi.zoom ?? 1);
  const [appMode, setAppMode] = useState<AppMode>(storedUi.appMode ?? 'work');
  const [sidebarOpen, setSidebarOpen] = useState(storedUi.sidebarOpen ?? true);
  const [sidebarWidth, setSidebarWidth] = useState(storedUi.sidebarWidth ?? DEFAULT_SIDEBAR_WIDTH);
  const [searchQuery, setSearchQuery] = useState(storedUi.searchQuery ?? '');
  const [viewMode, setViewMode] = useState<ViewMode>(storedUi.viewMode ?? 'split');
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(storedUi.autoSaveEnabled ?? true);
  const [persistSessionEnabled, setPersistSessionEnabled] = useState(storedUi.persistSessionEnabled ?? true);
  const [showLineNumbers, setShowLineNumbers] = useState(storedUi.showLineNumbers ?? true);
  const [persistenceDiagnosticsEnabled, setPersistenceDiagnosticsEnabled] = useState(storedUi.persistenceDiagnosticsEnabled ?? false);

  const setTheme = async (newTheme: AppTheme) => {
    await themeService.setTheme(newTheme);
    setThemeState(newTheme);
  };

  const adjustZoom = (delta: number) => {
    const newZoom = Math.max(0.7, Math.min(1.5, zoom + delta));
    setZoom(newZoom);
  };

  useEffect(() => {
    const payload: StoredUiState = {
      zoom,
      appMode,
      sidebarOpen,
      sidebarWidth,
      searchQuery,
      viewMode,
      autoSaveEnabled,
      persistSessionEnabled,
      showLineNumbers,
      persistenceDiagnosticsEnabled,
    };
    window.localStorage.setItem(UI_STATE_KEY, JSON.stringify(payload));

    storage.setSetting(UI_STATE_KEY, payload).catch((error) => {
      console.warn('[useUIState] Failed to persist UI state in IndexedDB', error);
    });
  }, [zoom, appMode, sidebarOpen, sidebarWidth, searchQuery, viewMode, autoSaveEnabled, persistSessionEnabled, showLineNumbers, persistenceDiagnosticsEnabled]);

  useEffect(() => {
    let isMounted = true;

    storage.getSetting<StoredUiState>(UI_STATE_KEY)
      .then((storedState) => {
        if (!isMounted || !storedState) {
          return;
        }

        if (typeof storedState.zoom === 'number') setZoom(storedState.zoom);
        if (storedState.appMode === 'work' || storedState.appMode === 'git') setAppMode(storedState.appMode);
        if (typeof storedState.sidebarOpen === 'boolean') setSidebarOpen(storedState.sidebarOpen);
        if (typeof storedState.sidebarWidth === 'number') setSidebarWidth(storedState.sidebarWidth);
        if (typeof storedState.searchQuery === 'string') setSearchQuery(storedState.searchQuery);
        if (storedState.viewMode === 'editor' || storedState.viewMode === 'split' || storedState.viewMode === 'preview') {
          setViewMode(storedState.viewMode);
        }
        if (typeof storedState.autoSaveEnabled === 'boolean') setAutoSaveEnabled(storedState.autoSaveEnabled);
        if (typeof storedState.persistSessionEnabled === 'boolean') setPersistSessionEnabled(storedState.persistSessionEnabled);
        if (typeof storedState.showLineNumbers === 'boolean') setShowLineNumbers(storedState.showLineNumbers);
        if (typeof storedState.persistenceDiagnosticsEnabled === 'boolean') setPersistenceDiagnosticsEnabled(storedState.persistenceDiagnosticsEnabled);
      })
      .catch((error) => {
        console.warn('[useUIState] Failed to load UI state from IndexedDB', error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    themeService.initTheme().then((resolvedTheme) => {
      if (isMounted) {
        setThemeState(resolvedTheme);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return {
    showSettings, setShowSettings,
    showPalette, setShowPalette,
    theme, setTheme,
    zoom, setZoom, adjustZoom,
    appMode, setAppMode,
    sidebarOpen, setSidebarOpen,
    sidebarWidth, setSidebarWidth,
    searchQuery, setSearchQuery,
    viewMode, setViewMode,
    cursorPos, setCursorPos,
    autoSaveEnabled, setAutoSaveEnabled,
    persistSessionEnabled, setPersistSessionEnabled,
    showLineNumbers, setShowLineNumbers,
    persistenceDiagnosticsEnabled, setPersistenceDiagnosticsEnabled,
  };
};
