
import { useState, useEffect } from 'react';
import { AppTheme, AppMode, ViewMode } from '../types';
import * as themeService from '../services/themeService';

export const useUIState = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  
  const [theme, setThemeState] = useState<AppTheme>(() => themeService.getStoredTheme());
  const [zoom, setZoom] = useState(1);
  const [appMode, setAppMode] = useState<AppMode>('work');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });

  const setTheme = async (newTheme: AppTheme) => {
    await themeService.setTheme(newTheme);
    setThemeState(newTheme);
  };

  const adjustZoom = (delta: number) => {
    const newZoom = Math.max(0.7, Math.min(1.5, zoom + delta));
    setZoom(newZoom);
  };

  // Initial theme sync on mount
  useEffect(() => {
    themeService.initTheme();
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
    cursorPos, setCursorPos
  };
};
