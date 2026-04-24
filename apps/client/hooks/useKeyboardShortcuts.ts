import { useEffect } from 'react';
import { AppMode, ViewMode } from '../types';

interface KeyboardShortcutActions {
  saveCurrentFile: () => void;
  promptNewFile: () => void;
  toggleSidebar: () => void;
  setShowPalette: (open: boolean) => void;
  setShowSettings: (open: boolean) => void;
  setViewMode: (mode: ViewMode) => void;
  adjustZoom: (delta: number) => void;
  setZoom: (zoom: number) => void;
  setAppMode: (mode: AppMode) => void;
  setSidebarOpen: (open: boolean) => void;
  selectNextTab: () => void;
  selectPreviousTab: () => void;
  closeInputModal: () => void;
  printPreview: () => void;
}

interface KeyboardShortcutState {
  showPalette: boolean;
  showSettings: boolean;
  showInputModal: boolean;
  hasActiveProject: boolean;
  appMode: AppMode;
}

export const useKeyboardShortcuts = (
  state: KeyboardShortcutState,
  actions: KeyboardShortcutActions
) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;

      const key = event.key.toLowerCase();
      const meta = event.metaKey || event.ctrlKey;
      const shift = event.shiftKey;
      const isModalOpen = state.showPalette || state.showSettings || state.showInputModal;

      if (key === 'escape') {
        if (state.showPalette) {
          actions.setShowPalette(false);
          return;
        }
        if (state.showInputModal) {
          actions.closeInputModal();
          return;
        }
        if (state.showSettings) {
          actions.setShowSettings(false);
          return;
        }
        if (state.appMode === 'git') {
          actions.setAppMode('work');
        }
        return;
      }

      if (isModalOpen) return;

      if (meta && key === 's') {
        event.preventDefault();
        actions.saveCurrentFile();
        return;
      }

      if (!state.hasActiveProject) return;

      if (meta && key === 'p') {
        event.preventDefault();
        actions.printPreview();
        return;
      }

      if (meta && key === 'k') {
        event.preventDefault();
        actions.setShowPalette(true);
        return;
      }

      if (meta && key === 'n') {
        event.preventDefault();
        actions.promptNewFile();
        return;
      }

      if (meta && key === ',') {
        event.preventDefault();
        actions.setShowSettings(true);
        return;
      }

      if (meta && shift && key === 'b') {
        event.preventDefault();
        actions.toggleSidebar();
        return;
      }

      if (meta && shift && key === 'g') {
        event.preventDefault();
        actions.setAppMode(state.appMode === 'git' ? 'work' : 'git');
        return;
      }

      if (meta && key === 'tab') {
        event.preventDefault();
        if (shift) {
          actions.selectPreviousTab();
        } else {
          actions.selectNextTab();
        }
        return;
      }

      if (meta && key === '1') {
        event.preventDefault();
        actions.setViewMode('editor');
        return;
      }

      if (meta && key === '2') {
        event.preventDefault();
        actions.setViewMode('split');
        return;
      }

      if (meta && key === '3') {
        event.preventDefault();
        actions.setViewMode('preview');
        return;
      }

      if (meta && (key === '=' || key === '+')) {
        event.preventDefault();
        actions.adjustZoom(0.1);
        return;
      }

      if (meta && key === '-') {
        event.preventDefault();
        actions.adjustZoom(-0.1);
        return;
      }

      if (meta && key === '0') {
        event.preventDefault();
        actions.setZoom(1);
        return;
      }

      if (meta && shift && key === 'e') {
        event.preventDefault();
        actions.setSidebarOpen(true);
        requestAnimationFrame(() => {
          const explorer = document.querySelector<HTMLElement>('.file-tree-container');
          explorer?.focus();
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    actions,
    state.appMode,
    state.hasActiveProject,
    state.showInputModal,
    state.showPalette,
    state.showSettings
  ]);
};
