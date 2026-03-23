import React from 'react';
import { createExtensionRuntime } from '@markdown-workspace/extension-runtime';
import { createExtensionManagerBundledEntry } from '@markdown-workspace/extension-manager';
import { createGeminiAgentBundledEntry } from '@markdown-workspace/extension-gemini-agent';
import { createThemeStudioBundledEntry } from '@markdown-workspace/extension-theme-studio';
import { useClientExtensionHost, useClientRuntimeServices } from '../../app/runtime/ClientRuntimeContext';
import { ExtensionRuntimeDiagnosticsPanel } from './ExtensionRuntimeDiagnosticsPanel';
import { ExtensionRuntimeContextProvider } from './ExtensionRuntimeContext';
import { createClientExtensionRegistrationSink } from './createClientExtensionRegistrationSink';
import { runtimeSmokeExtensionEntry } from './bundled';

export interface ExtensionRuntimeProviderProps extends React.PropsWithChildren {}

export const ExtensionRuntimeProvider: React.FC<ExtensionRuntimeProviderProps> = ({ children }) => {
  const services = useClientRuntimeServices();
  const host = useClientExtensionHost();

  const registrationSink = React.useMemo(() => createClientExtensionRegistrationSink(services), [services]);
  const runtime = React.useMemo(() => createExtensionRuntime({
    host,
    registrationSink,
    storage: services.settingsStore,
  }), [host, registrationSink, services.settingsStore]);

  const bundledEntries = React.useMemo(() => [
    createExtensionManagerBundledEntry({ runtime }),
    createGeminiAgentBundledEntry(),
    createThemeStudioBundledEntry(),
    runtimeSmokeExtensionEntry,
  ], [runtime]);

  React.useEffect(() => {
    const disposables = bundledEntries.map((entry) => runtime.registerBundledExtension(entry));
    void runtime.start();
    return () => {
      void runtime.stop();
      for (const disposable of disposables) {
        disposable.dispose();
      }
    };
  }, [bundledEntries, runtime]);

  React.useEffect(() => {
    const disposable = services.settingsRegistry.register({
      id: 'core.settings.extensions.runtime',
      title: { defaultMessage: 'Extension Runtime' },
      description: { defaultMessage: 'Bundled extension catalog, activation state, and runtime diagnostics.' },
      order: 10,
      panel: 'extensions',
      icon: { kind: 'lucide', name: 'Puzzle' },
      render: () => <ExtensionRuntimeDiagnosticsPanel />,
    });
    return () => disposable.dispose();
  }, [services.settingsRegistry]);

  return (
    <ExtensionRuntimeContextProvider runtime={runtime}>
      {children}
    </ExtensionRuntimeContextProvider>
  );
};
