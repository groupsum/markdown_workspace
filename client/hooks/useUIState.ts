
import { useState, useEffect } from 'react';
import { AppTheme, AppMode, ViewMode } from '../types';
import * as themeService from '../services/themeService';

const UI_STATE_KEY = 'lattice-ui-state';

type StoredUiState = {
  zoom: number;
  appMode: AppMode;
  sidebarOpen: boolean;
  searchQuery: string;
  viewMode: ViewMode;
  autoSaveEnabled: boolean;
  persistSessionEnabled: boolean;
};

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
  const [searchQuery, setSearchQuery] = useState(storedUi.searchQuery ?? '');
  const [viewMode, setViewMode] = useState<ViewMode>(storedUi.viewMode ?? 'split');
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(storedUi.autoSaveEnabled ?? true);
  const [persistSessionEnabled, setPersistSessionEnabled] = useState(storedUi.persistSessionEnabled ?? true);

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
      searchQuery,
      viewMode,
      autoSaveEnabled,
      persistSessionEnabled
    };
    window.localStorage.setItem(UI_STATE_KEY, JSON.stringify(payload));
  }, [zoom, appMode, sidebarOpen, searchQuery, viewMode, autoSaveEnabled, persistSessionEnabled]);

  // Initial theme sync on mount
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
    searchQuery, setSearchQuery,
    viewMode, setViewMode,
    cursorPos, setCursorPos,
    autoSaveEnabled, setAutoSaveEnabled,
    persistSessionEnabled, setPersistSessionEnabled
  };
};
