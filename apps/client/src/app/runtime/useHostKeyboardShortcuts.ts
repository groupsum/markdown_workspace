import React from 'react';
import { useSyncExternalStore } from 'react';
import { useClientRuntimeServices, useClientRuntimeSnapshot } from './ClientRuntimeContext';

export const useHostKeyboardShortcuts = (): void => {
  const runtime = useClientRuntimeSnapshot();
  const services = useClientRuntimeServices();
  const viewSnapshot = useSyncExternalStore(services.views.subscribe, services.views.getSnapshot, services.views.getSnapshot);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;

      const key = event.key.toLowerCase();
      const meta = event.metaKey || event.ctrlKey;
      const shift = event.shiftKey;
      const commandPaletteOpen = viewSnapshot.openViewIds.includes('core.command-palette');
      const settingsOpen = viewSnapshot.openViewIds.includes('core.settings');
      const modalOpen = commandPaletteOpen || settingsOpen || runtime.app.state.showInputModal;

      if (key === 'escape') {
        if (commandPaletteOpen) {
          void services.views.close('core.command-palette');
          return;
        }
        if (runtime.app.state.showInputModal) {
          runtime.app.actions.closeInputModal();
          return;
        }
        if (settingsOpen) {
          void services.views.close('core.settings');
          return;
        }
        if (runtime.app.state.appMode === 'git') {
          void services.views.close('core.git-pane');
        }
        return;
      }

      if (modalOpen) return;

      if (meta && key === 's') {
        event.preventDefault();
        void services.commands.execute('core.save-current-file');
        return;
      }

      if (!runtime.app.state.activeProjectId) return;

      if (meta && key === 'p') {
        event.preventDefault();
        void services.commands.execute('core.print-preview');
        return;
      }

      if (meta && key === 'k') {
        event.preventDefault();
        void services.views.open('core.command-palette');
        return;
      }

      if (meta && key === 'n') {
        event.preventDefault();
        void services.commands.execute('core.new-file');
        return;
      }

      if (meta && key === ',') {
        event.preventDefault();
        void services.views.open('core.settings');
        return;
      }

      if (meta && shift && key === 'b') {
        event.preventDefault();
        void services.commands.execute('core.toggle-explorer');
        return;
      }

      if (meta && shift && key === 'g') {
        event.preventDefault();
        void services.commands.execute('core.toggle-git-pane');
        return;
      }

      if (meta && key === 'tab') {
        event.preventDefault();
        void services.commands.execute(shift ? 'core.previous-tab' : 'core.next-tab');
        return;
      }

      if (meta && key === '1') {
        event.preventDefault();
        void services.commands.execute('core.view-editor');
        return;
      }

      if (meta && key === '2') {
        event.preventDefault();
        void services.commands.execute('core.view-split');
        return;
      }

      if (meta && key === '3') {
        event.preventDefault();
        void services.commands.execute('core.view-preview');
        return;
      }

      if (meta && (key === '=' || key === '+')) {
        event.preventDefault();
        void services.commands.execute('core.zoom-in');
        return;
      }

      if (meta && key === '-') {
        event.preventDefault();
        void services.commands.execute('core.zoom-out');
        return;
      }

      if (meta && key === '0') {
        event.preventDefault();
        void services.commands.execute('core.zoom-reset');
        return;
      }

      if (meta && shift && key === 'e') {
        event.preventDefault();
        void services.commands.execute('core.focus-explorer');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [runtime.app.actions, runtime.app.state.activeProjectId, runtime.app.state.appMode, runtime.app.state.showInputModal, services.commands, services.views, viewSnapshot.openViewIds]);
};
