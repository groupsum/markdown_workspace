import React from 'react';
import { useApp } from '../../hooks/useApp';
import { usePwa } from '../../hooks/usePwa';
import { ClientRuntimeProvider } from './runtime/ClientRuntimeContext';
import { useHostKeyboardShortcuts } from './runtime/useHostKeyboardShortcuts';
import { AppShell } from '../shell/AppShell';
import { ExtensionRuntimeProvider } from '../extensions/runtime';

const AppRuntimeConsumer: React.FC = () => {
  useHostKeyboardShortcuts();
  return <AppShell />;
};

export const AppRoot: React.FC = () => {
  const app = useApp();
  const pwa = usePwa();
  const [online, setOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      app.actions.addToast('SYSTEM ONLINE', 'success');
    };
    const handleOffline = () => {
      setOnline(false);
      app.actions.addToast('SYSTEM OFFLINE', 'warning');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [app.actions]);

  const activeTabName = React.useMemo(() => {
    const activeTab = app.state.tabs.find((tab) => tab.id === app.state.activeTabId);
    if (!activeTab) return null;
    const activeFile = app.state.files.find((file) => file.id === activeTab.fileId);
    return activeFile?.name ?? null;
  }, [app.state.activeTabId, app.state.files, app.state.tabs]);

  return (
    <ClientRuntimeProvider
      snapshot={{
        app,
        pwa,
        online,
        activeTabName,
      }}
    >
      <ExtensionRuntimeProvider>
        <AppRuntimeConsumer />
      </ExtensionRuntimeProvider>
    </ClientRuntimeProvider>
  );
};
